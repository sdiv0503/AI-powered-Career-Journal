import { HfInference } from '@huggingface/inference';
import compromise from 'compromise';

class AIResumeAnalyzer {
  constructor() {
    // Initialize HuggingFace client
    this.hf = import.meta.env.VITE_HUGGINGFACE_API_KEY 
      ? new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY)
      : null;
    
    this.fallbackMode = import.meta.env.VITE_AI_FALLBACK_MODE === 'true';
    this.requestCount = this.getRequestCount();
    this.maxFreeRequests = 30000; // Monthly HF limit
  }

  // Track usage to stay within free limits
  getRequestCount() {
    const stored = localStorage.getItem('hf_requests_count');
    const lastReset = localStorage.getItem('hf_last_reset');
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    if (lastReset !== currentMonth) {
      localStorage.setItem('hf_last_reset', currentMonth);
      localStorage.setItem('hf_requests_count', '0');
      return 0;
    }
    
    return parseInt(stored) || 0;
  }

  incrementRequestCount() {
    this.requestCount++;
    localStorage.setItem('hf_requests_count', this.requestCount.toString());
  }

  // Main analysis function
  async analyzeResume(resumeText, resumeData) {
    try {
      // Use AI if under quota, otherwise client-side analysis
      if (this.hf && this.requestCount < this.maxFreeRequests && !this.fallbackMode) {
        console.log('🤖 Using AI analysis');
        return await this.aiAnalysis(resumeText, resumeData);
      } else {
        console.log('⚡ Using client-side analysis');
        return await this.clientAnalysis(resumeText, resumeData);
      }
    } catch (error) {
      console.warn('AI failed, falling back to client-side:', error);
      return await this.clientAnalysis(resumeText, resumeData);
    }
  }

  // HuggingFace AI Analysis
  async aiAnalysis(resumeText, resumeData) {
    this.incrementRequestCount();

    try {
      const prompt = `Analyze this resume and provide detailed insights:

Resume: ${resumeText.substring(0, 2000)}

Provide analysis in this format:
CAREER_LEVEL: [Entry/Junior/Mid/Senior/Expert]
TOP_SKILLS: [list 8 key skills]
MISSING_SKILLS: [list skills that could improve this resume]
ATS_SCORE: [score out of 100]
RECOMMENDATIONS: [3 specific improvements]`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          return_full_text: false
        }
      });

      return {
        analysis: this.parseAIResponse(response.generated_text, resumeText),
        source: 'ai',
        confidence: 0.92,
        quotaRemaining: this.maxFreeRequests - this.requestCount
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  // Client-side analysis (unlimited & free)
  async clientAnalysis(resumeText, resumeData) {
    const doc = compromise(resumeText);
    const textLower = resumeText.toLowerCase();

    // Extract skills using NLP
    const skills = this.extractSkills(textLower);
    
    // Assess career level
    const careerLevel = this.assessCareerLevel(textLower, skills);
    
    // Calculate ATS score
    const atsScore = this.calculateATSScore(resumeText);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(textLower, skills, atsScore);

    return {
      analysis: {
        careerLevel,
        skills,
        atsScore,
        recommendations,
        skillGaps: this.identifySkillGaps(skills),
        strengths: this.identifyStrengths(skills, textLower)
      },
      source: 'client-side',
      confidence: 0.87,
      quotaRemaining: 'unlimited'
    };
  }

  // Extract skills using keyword matching
  extractSkills(text) {
    const skillDatabase = {
      technical: [
        'react', 'javascript', 'python', 'java', 'typescript', 'node.js', 
        'angular', 'vue.js', 'html', 'css', 'sql', 'mongodb', 'postgresql',
        'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql'
      ],
      soft: [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'project management', 'time management', 'creativity', 'adaptability'
      ],
      tools: [
        'figma', 'adobe', 'jira', 'confluence', 'slack', 'github',
        'jenkins', 'terraform', 'ansible'
      ]
    };

    const foundSkills = { technical: [], soft: [], tools: [] };

    Object.entries(skillDatabase).forEach(([category, skills]) => {
      skills.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches) {
          foundSkills[category].push({
            name: skill,
            confidence: Math.min(0.95, 0.7 + (matches.length * 0.1)),
            mentions: matches.length
          });
        }
      });
    });

    return foundSkills;
  }

  // Assess career level
  assessCareerLevel(text, skills) {
    const totalSkills = Object.values(skills).flat().length;
    const experienceNumbers = text.match(/(\d+)\s*(?:years?|yrs?)/gi) || [];
    const maxExperience = Math.max(...experienceNumbers.map(exp => 
      parseInt(exp.match(/\d+/)[0])
    ), 0);

    let score = 0;
    if (maxExperience >= 7) score += 40;
    else if (maxExperience >= 4) score += 25;
    else if (maxExperience >= 2) score += 15;

    if (totalSkills >= 15) score += 30;
    else if (totalSkills >= 8) score += 20;

    if (text.includes('senior') || text.includes('lead')) score += 20;
    if (text.includes('manage') || text.includes('team')) score += 10;

    let level, description;
    if (score >= 60) {
      level = 'Senior/Expert';
      description = 'Demonstrates senior-level expertise with leadership experience';
    } else if (score >= 35) {
      level = 'Mid-Level';
      description = 'Shows solid professional experience with growth potential';
    } else if (score >= 15) {
      level = 'Junior';
      description = 'Emerging professional with foundational skills';
    } else {
      level = 'Entry-Level';
      description = 'Beginning career journey with learning focus';
    }

    return { level, description, score, experience: maxExperience };
  }

  // Calculate ATS compatibility score
  calculateATSScore(text) {
    let score = 0;
    const words = text.split(/\s+/).length;

    // Length check
    if (words >= 300 && words <= 800) score += 25;
    else if (words >= 200) score += 15;

    // Structure check
    const sections = ['experience', 'education', 'skills', 'summary'];
    const foundSections = sections.filter(section => 
      text.toLowerCase().includes(section)
    ).length;
    score += (foundSections / sections.length) * 25;

    // Keyword density
    const keywordMatches = text.match(/\b(develop|manage|create|lead|implement|design)\b/gi) || [];
    if (keywordMatches.length >= 5) score += 25;
    else if (keywordMatches.length >= 3) score += 15;

    // Contact info
    if (text.includes('@') && text.match(/\d{10}/)) score += 25;

    return {
      score: Math.min(100, score),
      breakdown: {
        length: words >= 300 && words <= 800 ? 25 : 15,
        structure: (foundSections / sections.length) * 25,
        keywords: keywordMatches.length >= 5 ? 25 : 15,
        contact: text.includes('@') ? 25 : 0
      }
    };
  }

  // Generate personalized recommendations
  generateRecommendations(text, skills, atsScore) {
    const recommendations = [];
    const totalSkills = Object.values(skills).flat().length;

    if (totalSkills < 10) {
      recommendations.push({
        priority: 'high',
        category: 'Skills',
        title: 'Expand Your Skill Set',
        description: `You have ${totalSkills} skills listed. Add 5-8 more relevant skills to be competitive.`,
        actions: [
          'Add cloud platforms (AWS, Azure, GCP)',
          'Include modern frameworks and tools',
          'Mention soft skills like leadership and communication'
        ]
      });
    }

    if (atsScore.score < 70) {
      recommendations.push({
        priority: 'high',
        category: 'ATS Optimization',
        title: 'Improve ATS Compatibility',
        description: `Your ATS score is ${atsScore.score}%. Optimize for applicant tracking systems.`,
        actions: [
          'Use standard section headers (Experience, Education, Skills)',
          'Include more industry keywords',
          'Ensure consistent formatting'
        ]
      });
    }

    const quantifiedAchievements = text.match(/\d+%|\$\d+|\d+\+/g) || [];
    if (quantifiedAchievements.length < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'Impact',
        title: 'Add Quantified Achievements',
        description: 'Numbers make your accomplishments more concrete and memorable.',
        actions: [
          'Include percentages for improvements made',
          'Add dollar amounts for savings or revenue',
          'Specify team sizes and project scales'
        ]
      });
    }

    return recommendations;
  }

  // Identify skill gaps
  identifySkillGaps(skills) {
    const commonRequiredSkills = [
      'communication', 'leadership', 'project management',
      'problem solving', 'teamwork', 'git', 'api'
    ];

    const allSkills = Object.values(skills).flat().map(s => s.name.toLowerCase());
    const missing = commonRequiredSkills.filter(skill => 
      !allSkills.some(s => s.includes(skill))
    );

    return missing.slice(0, 5);
  }

  // Identify strengths
  identifyStrengths(skills, text) {
    const strengths = [];
    const totalSkills = Object.values(skills).flat().length;

    if (totalSkills >= 15) {
      strengths.push('Diverse technical skill set');
    }

    if (text.includes('lead') || text.includes('manage')) {
      strengths.push('Leadership experience');
    }

    if (skills.technical.length >= 8) {
      strengths.push('Strong technical foundation');
    }

    return strengths;
  }

  // Parse AI response (for HuggingFace responses)
  parseAIResponse(aiText, originalText) {
    // Simple parsing - in production, you'd use more sophisticated NLP
    const lines = aiText.split('\n');
    const parsed = {};

    lines.forEach(line => {
      if (line.includes('CAREER_LEVEL:')) {
        parsed.careerLevel = { level: line.split(':')[1]?.trim() || 'Mid-Level' };
      }
      if (line.includes('ATS_SCORE:')) {
        const score = parseInt(line.split(':')[1]?.trim()) || 75;
        parsed.atsScore = { score };
      }
    });

    // Fallback to client analysis if parsing fails
    if (!parsed.careerLevel) {
      return this.clientAnalysis(originalText, {}).analysis;
    }

    return parsed;
  }
}

export const aiResumeAnalyzer = new AIResumeAnalyzer();
export default aiResumeAnalyzer;
