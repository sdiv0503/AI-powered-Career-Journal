import * as pdfjsLib from "pdfjs-dist";
import nlp from "compromise";

// ✅ Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

export class EnhancedPDFParser {
  constructor() {
    this.skillKeywords = this.initializeEnhancedSkillKeywords();
    this.sectionPatterns = this.initializeSectionPatterns();
    this.contextFilters = this.initializeContextFilters();
  }

  // 🎯 Enhanced skill database
  initializeEnhancedSkillKeywords() {
    return {
      languages: {
        JavaScript: [
          "javascript",
          "js",
          "es6",
          "es2015",
          "ecmascript",
          "vanilla js",
        ],
        TypeScript: ["typescript", "ts"],
        Python: ["python", "py", "python3"],
        Java: ["java", "openjdk", "oracle java"],
        "C#": ["c#", "csharp", "c sharp", ".net"],
        "C++": ["c++", "cpp", "c plus plus"],
        Go: ["golang", "go lang"],
        Rust: ["rust lang"],
        PHP: ["php", "php7", "php8"],
        Ruby: ["ruby", "ruby on rails"],
        Swift: ["swift", "swift ui"],
        Kotlin: ["kotlin"],
        SQL: ["sql", "mysql", "postgresql", "sqlite", "t-sql"],
        HTML: ["html", "html5", "html/css"],
        CSS: ["css", "css3", "sass", "scss", "less"],
      },
      frameworks: {
        React: ["react", "reactjs", "react.js", "react native"],
        Angular: ["angular", "angularjs", "angular2", "angular4"],
        "Vue.js": ["vue", "vuejs", "vue.js", "nuxt"],
        "Node.js": ["node", "nodejs", "node.js", "npm"],
        Express: ["express", "expressjs", "express.js"],
        Django: ["django"],
        Flask: ["flask"],
        Spring: ["spring", "spring boot", "spring framework"],
        Laravel: ["laravel"],
        "Next.js": ["next", "nextjs", "next.js"],
        Svelte: ["svelte", "sveltekit"],
      },
      databases: {
        MongoDB: ["mongodb", "mongo", "mongoose"],
        PostgreSQL: ["postgresql", "postgres", "psql"],
        MySQL: ["mysql"],
        Redis: ["redis"],
        Firebase: ["firebase", "firestore"],
        SQLite: ["sqlite"],
        Oracle: ["oracle db", "oracle database"],
        Cassandra: ["cassandra"],
        DynamoDB: ["dynamodb", "dynamo"],
      },
      cloud: {
        AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
        Azure: ["azure", "microsoft azure"],
        "Google Cloud": ["gcp", "google cloud", "google cloud platform"],
        Docker: ["docker", "containerization"],
        Kubernetes: ["kubernetes", "k8s"],
        Heroku: ["heroku"],
        Vercel: ["vercel"],
      },
      tools: {
        Git: ["git", "github", "gitlab", "version control"],
        Jenkins: ["jenkins", "ci/cd"],
        "GitHub Actions": ["github actions"],
        Webpack: ["webpack"],
        Vite: ["vite"],
        ESLint: ["eslint", "linting"],
        Jest: ["jest", "unit testing"],
        Cypress: ["cypress", "e2e testing"],
        Postman: ["postman", "api testing"],
        "VS Code": ["vscode", "visual studio code"],
        Figma: ["figma", "design"],
        Jira: ["jira", "project management"],
      },
    };
  }

  initializeContextFilters() {
    return {
      negativeContexts: [
        /not familiar with/i,
        /no experience with/i,
        /learning/i,
        /interested in learning/i,
        /would like to learn/i,
        /basic understanding/i,
      ],
      positiveContexts: [
        /experience with/i,
        /proficient in/i,
        /expert in/i,
        /skilled in/i,
        /worked with/i,
        /developed using/i,
        /built with/i,
        /implemented/i,
      ],
    };
  }

  initializeSectionPatterns() {
    return {
      contact: /^(contact|personal info|details)$/i,
      summary:
        /^(summary|objective|profile|about|overview|professional summary)$/i,
      experience:
        /^(experience|employment|work history|career|professional experience|work experience)$/i,
      education:
        /^(education|academic|qualifications|degree|university|college|certification)$/i,
      skills:
        /^(skills|technical skills|competencies|technologies|expertise|proficiencies|core competencies)$/i,
      projects:
        /^(projects|portfolio|work samples|key projects|notable projects)$/i,
      certifications:
        /^(certifications?|certificates?|licenses?|credentials)$/i,
      awards: /^(awards?|honors?|recognition|achievements|accomplishments)$/i,
    };
  }

  // 📅 Enhanced date extraction using comprehensive regex patterns
  extractDatesFromText(text) {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
      /\b\d{4}-\d{1,2}-\d{1,2}\b/g, // YYYY-MM-DD
      /\b\d{1,2}-\d{1,2}-\d{4}\b/g, // MM-DD-YYYY
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi, // Month YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, // Full month
      /\b\d{4}\s*-\s*\d{4}\b/g, // Year ranges like 2020-2023
      /\b\d{4}\s*to\s*\d{4}\b/gi, // Year ranges like 2020 to 2023
      /\b\d{4}\s*–\s*\d{4}\b/g, // Year ranges with em dash
      /\b\d{4}\b/g, // Just years
    ];

    const dates = [];
    datePatterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      dates.push(...matches);
    });

    return [...new Set(dates)]; // Remove duplicates
  }

  // 🎯 Main parsing method
  async parseResume(file) {
    try {
      console.log(`🔍 Starting enhanced PDF parsing for: ${file.name}`);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;

      console.log(`📄 PDF loaded with ${pdfDocument.numPages} pages`);

      // Extract text with better formatting preservation
      const textContent = await this.extractTextWithLayout(pdfDocument);

      // Parse using enhanced NLP and context analysis
      const parsedResume = await this.parseWithEnhancedNLP(
        textContent,
        file.name
      );

      console.log("✅ Enhanced PDF parsing completed successfully");
      return parsedResume;
    } catch (error) {
      console.error("❌ Enhanced PDF parsing error:", error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  // 📖 Enhanced text extraction preserving layout
  async extractTextWithLayout(pdfDocument) {
    const sections = [];

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group text items by vertical position (lines)
        const lines = this.groupTextIntoLines(textContent.items);

        // ✅ ENHANCED: Better section identification with positioning
        const pageSections = this.identifySectionsWithPositioning(lines);

        sections.push({
          pageNumber: pageNum,
          sections: pageSections,
          rawText: lines.map((line) => line.text).join("\n"),
        });

        console.log(
          `📖 Extracted ${pageSections.length} sections from page ${pageNum}`
        );
      } catch (pageError) {
        console.warn(`⚠️ Error extracting page ${pageNum}:`, pageError);
      }
    }

    return sections;
  }

  // 🧩 Group text items into logical lines
  groupTextIntoLines(items) {
    const lines = [];
    const lineThreshold = 5;

    items.forEach((item) => {
      const y = item.transform[5];
      const existingLine = lines.find(
        (line) => Math.abs(line.y - y) < lineThreshold
      );

      if (existingLine) {
        existingLine.items.push(item);
      } else {
        lines.push({
          y: y,
          items: [item],
          text: "",
        });
      }
    });

    lines.sort((a, b) => b.y - a.y);

    lines.forEach((line) => {
      line.items.sort((a, b) => a.transform[4] - b.transform[4]);
      line.text = line.items
        .map((item) => item.str)
        .join(" ")
        .trim();
    });

    return lines.filter((line) => line.text.length > 0);
  }

  // ✅ ENHANCED: Better section identification with position-based contact detection
  identifySectionsWithPositioning(lines) {
    const sections = [];
    let currentSection = null;

    // Enhanced contact detection patterns
    const contactIndicators = {
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      phone: /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
      linkedin: /linkedin\.com\/in\/[a-zA-Z0-9-]+/i,
      github: /github\.com\/[a-zA-Z0-9-]+/i,
      address: /\b\d+\s+[a-zA-Z\s]+,\s*[a-zA-Z\s]+,?\s*[a-zA-Z]{2}\s*\d{5}/i,
      website: /(https?:\/\/[^\s]+)/i,
    };

    for (let i = 0; i < lines.length; i++) {
      const text = lines[i].text.trim();
      const isTopOfDocument = i < 8; // First 8 lines are likely header/contact

      // ✅ PRIORITY: Detect contact information in top section
      if (isTopOfDocument) {
        let hasContactInfo = false;

        // Check if this line contains contact information
        Object.values(contactIndicators).forEach((pattern) => {
          if (pattern.test(text)) {
            hasContactInfo = true;
          }
        });

        // If we find contact info in top 8 lines, create/continue contact section
        if (
          hasContactInfo ||
          /^(contact|personal|info|details)$/i.test(text.toLowerCase()) ||
          (text.match(/^\w+\s+\w+$/) && text.length < 50)
        ) {
          // Likely a name

          if (!currentSection || currentSection.type !== "contact") {
            if (currentSection) {
              sections.push(currentSection);
            }
            currentSection = {
              type: "contact",
              header: "Contact Information",
              content: [],
              confidence: 0.95,
            };
          }
          currentSection.content.push(text);
          continue;
        }
      }

      // Standard section type detection
      const sectionType = this.identifySectionType(text);

      if (sectionType) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          type: sectionType,
          header: text,
          content: [],
          confidence: 0.9,
        };
      } else if (currentSection && text.length > 3) {
        // Add content to current section
        currentSection.content.push(text);
      } else if (
        !currentSection &&
        !sections.find((s) => s.type === "header")
      ) {
        // Content before any section header - treat as header info
        sections.push({
          type: "header",
          header: "Header Information",
          content: [text],
          confidence: 0.7,
        });
      }
    }

    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  // 🎯 Identify section type from text
  identifySectionType(text) {
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    for (const [sectionType, pattern] of Object.entries(this.sectionPatterns)) {
      if (pattern.test(cleanText)) {
        return sectionType;
      }
    }

    return null;
  }

  // 🧠 Enhanced parsing with better NLP
  async parseWithEnhancedNLP(textSections, fileName) {
    const allSections = textSections.flatMap((page) => page.sections);
    const fullText = textSections.map((page) => page.rawText).join("\n\n");

    console.log(
      `📝 Processing ${allSections.length} sections with enhanced NLP`
    );

    // ✅ ENHANCED: Better contact extraction
    const contact = this.extractContactWithEnhancedDetection(
      allSections,
      fullText
    );
    const skills = this.extractSkillsWithContext(allSections);
    const experience = this.extractExperienceWithNLP(allSections);
    const education = this.extractEducationWithNLP(allSections);

    // Calculate advanced metrics
    const skillAnalysis = this.analyzeSkillsAdvanced(skills, allSections);
    const qualityMetrics = this.calculateQualityMetrics(
      allSections,
      skills,
      contact
    );

    return {
      fileName,
      extractedAt: new Date(),

      // Structured data
      contact,
      skills,
      experience,
      education,
      sections: allSections,

      // Advanced analysis
      skillAnalysis,
      qualityMetrics,
      keywordDensity: this.calculateKeywordDensity(fullText),
      readabilityScore: this.calculateReadabilityScore(fullText),

      // Metadata
      pageCount: textSections.length,
      sectionCount: allSections.length,
      characterCount: fullText.length,
      confidence: qualityMetrics.overallConfidence || 0.8,
    };
  }

  // ✅ ENHANCED: Better contact extraction with multiple strategies
  // ✅ CORRECTED: extractContactWithEnhancedDetection method
extractContactWithEnhancedDetection(sections, fullText) {
  const contact = {};
  
  // Strategy 1: Look for dedicated contact section
  const contactSection = sections.find((s) => s.type === "contact");
  // Strategy 2: Look in header section
  const headerSection = sections.find((s) => s.type === "header");
  // Strategy 3: Scan first few lines of all text
  const topLines = fullText.split("\n").slice(0, 10).join(" ");
  
  // Combine all potential contact text
  const contactText = [
    contactSection?.content.join(" ") || "",
    headerSection?.content.join(" ") || "",
    topLines,
  ].join(" ");

  console.log("🔍 Contact detection text:", contactText.substring(0, 200));

  // ✅ FIXED: Enhanced extraction patterns with proper phone handling
  const patterns = {
    email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    // 🎯 FIXED: This regex captures only the 10-digit number, ignoring country codes
    phone: /(?:\+91[-.\s]?|1[-.\s]?)?(\d{10})/g,
    linkedin: /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
    github: /github\.com\/([a-zA-Z0-9-]+)/i,
    website: /(https?:\/\/[^\s]+)/g,
  };

  // Extract using patterns
  Object.entries(patterns).forEach(([key, pattern]) => {
    if (key === "phone") {
      // Special handling for phone numbers to extract only 10 digits
      const phoneMatches = [...contactText.matchAll(pattern)];
      if (phoneMatches.length > 0) {
        // Use the captured group (index 1) which contains only the 10 digits
        contact.phone = phoneMatches[0][1];
      }
    } else if (key === "linkedin") {
      const matches = contactText.match(pattern);
      if (matches) {
        contact.linkedin = `https://linkedin.com/in/${matches[1]}`;
      }
    } else if (key === "github") {
      const matches = contactText.match(pattern);
      if (matches) {
        contact.github = `https://github.com/${matches[1]}`;
      }
    } else {
      // For email and website, use the full match
      const matches = contactText.match(pattern);
      if (matches) {
        contact[key] = matches[0];
      }
    }
  });

  // Extract name using NLP
  try {
    const doc = nlp(contactText);
    const people = doc.people().out("array");
    if (people.length > 0) {
      contact.name = people[0];
    }
  } catch (error) {
    console.log("Name extraction failed, using fallback");
  }

  console.log("✅ Extracted contact info:", contact);
  return contact;
}


  // 💼 Extract skills with context awareness
  extractSkillsWithContext(sections) {
    const skillsSection = sections.find((s) => s.type === "skills");
    const experienceSection = sections.find((s) => s.type === "experience");

    const relevantText = [
      skillsSection?.content.join(" ") || "",
      experienceSection?.content.join(" ") || "",
    ].join(" ");

    const foundSkills = {};

    // Analyze each skill category
    Object.entries(this.skillKeywords).forEach(([category, skills]) => {
      foundSkills[category] = {};

      Object.entries(skills).forEach(([skillName, variants]) => {
        let matches = 0;
        let contexts = [];

        variants.forEach((variant) => {
          const regex = new RegExp(
            `\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "gi"
          );
          const skillMatches = relevantText.match(regex);

          if (skillMatches) {
            matches += skillMatches.length;
            skillMatches.forEach((match) => {
              const context = this.extractContext(relevantText, match);
              contexts.push(context);
            });
          }
        });

        if (matches > 0) {
          const confidence = this.calculateSkillConfidence(contexts);
          foundSkills[category][skillName] = {
            matches,
            contexts: contexts.slice(0, 3),
            confidence,
            level: this.inferSkillLevel(contexts),
          };
        }
      });
    });

    return foundSkills;
  }

  // 💼 Extract experience with enhanced date handling
  extractExperienceWithNLP(sections) {
    const experienceSection = sections.find((s) => s.type === "experience");
    if (!experienceSection) return {};

    const text = experienceSection.content.join(" ");

    try {
      const doc = nlp(text);
      const organizations = doc.organizations().out("array");
      const dates = this.extractDatesFromText(text);

      return {
        companies: organizations,
        dates: dates,
        rawText: text,
        confidence: 0.8,
      };
    } catch (error) {
      console.log("Experience extraction failed:", error.message);
      return {
        companies: [],
        dates: this.extractDatesFromText(text),
        rawText: text,
        confidence: 0.6,
      };
    }
  }

  // 🎓 Extract education with enhanced date handling
  extractEducationWithNLP(sections) {
    const educationSection = sections.find((s) => s.type === "education");
    if (!educationSection) return {};

    const text = educationSection.content.join(" ");

    try {
      const doc = nlp(text);
      const schools = doc.organizations().out("array");
      const dates = this.extractDatesFromText(text);

      return {
        schools: schools,
        dates: dates,
        rawText: text,
        confidence: 0.8,
      };
    } catch (error) {
      console.log("Education extraction failed:", error.message);
      return {
        schools: [],
        dates: this.extractDatesFromText(text),
        rawText: text,
        confidence: 0.6,
      };
    }
  }

  // Helper methods remain the same...
  extractContext(text, skill) {
    const skillIndex = text.toLowerCase().indexOf(skill.toLowerCase());
    if (skillIndex === -1) return "";

    const contextRadius = 50;
    const start = Math.max(0, skillIndex - contextRadius);
    const end = Math.min(
      text.length,
      skillIndex + skill.length + contextRadius
    );

    return text.substring(start, end).trim();
  }

  calculateSkillConfidence(contexts) {
    let confidence = 0.5;

    contexts.forEach((context) => {
      const contextLower = context.toLowerCase();

      this.contextFilters.positiveContexts.forEach((pattern) => {
        if (pattern.test(contextLower)) confidence += 0.2;
      });

      this.contextFilters.negativeContexts.forEach((pattern) => {
        if (pattern.test(contextLower)) confidence -= 0.3;
      });
    });

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  inferSkillLevel(contexts) {
    const contextText = contexts.join(" ").toLowerCase();

    if (/expert|advanced|senior|lead|architect/i.test(contextText))
      return "Expert";
    if (/proficient|experienced|solid|strong/i.test(contextText))
      return "Proficient";
    if (/familiar|basic|some|junior/i.test(contextText)) return "Beginner";

    return "Intermediate";
  }

  analyzeSkillsAdvanced(skills, sections) {
    const allSkills = Object.values(skills).flatMap((category) =>
      Object.entries(category).map(([name, data]) => ({ name, ...data }))
    );

    const totalSkills = allSkills.length;
    const highConfidenceSkills = allSkills.filter((s) => s.confidence > 0.7);
    const expertSkills = allSkills.filter((s) => s.level === "Expert");

    return {
      totalSkills,
      highConfidenceSkills: highConfidenceSkills.length,
      expertSkills: expertSkills.length,
      skillsByCategory: Object.entries(skills).map(
        ([category, categorySkills]) => ({
          category,
          count: Object.keys(categorySkills).length,
          skills: categorySkills,
        })
      ),
      topSkills: allSkills
        .sort((a, b) => b.confidence * b.matches - a.confidence * a.matches)
        .slice(0, 10),
      recommendations: this.generateSmartRecommendations(skills, allSkills),
    };
  }

  generateSmartRecommendations(skills, allSkills) {
    const recommendations = [];

    const techCombos = [
      {
        name: "Full-Stack JavaScript",
        skills: ["JavaScript", "React", "Node.js"],
      },
      { name: "Cloud Development", skills: ["AWS", "Docker", "Kubernetes"] },
      { name: "Data Engineering", skills: ["Python", "SQL", "MongoDB"] },
    ];

    techCombos.forEach((combo) => {
      const hasSkills = combo.skills.filter((skill) =>
        allSkills.some((s) => s.name === skill && s.confidence > 0.6)
      );

      const missingSkills = combo.skills.filter(
        (skill) => !allSkills.some((s) => s.name === skill)
      );

      if (hasSkills.length > 0 && missingSkills.length > 0) {
        recommendations.push({
          type: "skill_combo",
          title: `Complete your ${combo.name} stack`,
          description: `You have ${hasSkills.join(
            ", "
          )}. Consider adding ${missingSkills.join(", ")}.`,
          priority: hasSkills.length / combo.skills.length,
          skills: missingSkills,
        });
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  // ✅ ENHANCED: Quality metrics now consider contact completeness
  calculateQualityMetrics(sections, skills, contact) {
    let qualityScore = 0;
    const metrics = {};

    // Section completeness (35% of score)
    const requiredSections = ["contact", "experience", "skills", "education"];
    const foundSections = sections.map((s) => s.type);
    const sectionCompleteness =
      requiredSections.filter((s) => foundSections.includes(s)).length /
      requiredSections.length;
    qualityScore += sectionCompleteness * 35;
    metrics.sectionCompleteness = Math.round(sectionCompleteness * 100);

    // Contact completeness (15% of score) - NEW!
    const contactFields = ["name", "email", "phone"];
    const foundContactFields = contactFields.filter((field) => contact[field]);
    const contactCompleteness =
      foundContactFields.length / contactFields.length;
    qualityScore += contactCompleteness * 15;
    metrics.contactCompleteness = Math.round(contactCompleteness * 100);

    // Skill diversity (25% of score)
    const totalSkills = Object.values(skills).flatMap((cat) =>
      Object.keys(cat)
    ).length;
    const skillDiversity = Math.min(totalSkills / 15, 1);
    qualityScore += skillDiversity * 25;
    metrics.skillDiversity = Math.round(skillDiversity * 100);

    // Content depth (25% of score)
    const totalContent = sections.reduce(
      (sum, section) => sum + section.content.join(" ").length,
      0
    );
    const contentDepth = Math.min(totalContent / 2000, 1);
    qualityScore += contentDepth * 25;
    metrics.contentDepth = Math.round(contentDepth * 100);

    return {
      overallScore: Math.round(qualityScore),
      overallConfidence: qualityScore / 100,
      sectionCompleteness: metrics.sectionCompleteness,
      contactCompleteness: metrics.contactCompleteness,
      skillDiversity: metrics.skillDiversity,
      contentDepth: metrics.contentDepth,
      recommendations: this.generateQualityRecommendations(metrics, contact),
    };
  }

  // ✅ ENHANCED: Better quality recommendations
  generateQualityRecommendations(metrics, contact) {
    const recommendations = [];

    if (metrics.sectionCompleteness < 75) {
      recommendations.push("Add missing sections like Education or Projects");
    }
    if (metrics.contactCompleteness < 80) {
      const missingContactFields = [];
      if (!contact.name) missingContactFields.push("name");
      if (!contact.email) missingContactFields.push("email");
      if (!contact.phone) missingContactFields.push("phone");
      if (missingContactFields.length > 0) {
        recommendations.push(
          `Include missing contact information: ${missingContactFields.join(
            ", "
          )}`
        );
      }
    }
    if (metrics.skillDiversity < 70) {
      recommendations.push("Include more technical skills and tools");
    }
    if (metrics.contentDepth < 60) {
      recommendations.push("Provide more detailed descriptions of experience");
    }

    return recommendations;
  }

  calculateKeywordDensity(text) {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
    const wordCount = {};

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        frequency: count / words.length,
      }));
  }

  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = text.split(/[aeiouAEIOU]/).length;

    if (sentences === 0 || words === 0) return 0;

    const score =
      206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Export enhanced parser instance
export const enhancedPdfParser = new EnhancedPDFParser();
