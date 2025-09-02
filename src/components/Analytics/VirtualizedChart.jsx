import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion } from 'framer-motion';

// React 19 optimized virtualized component
const VirtualizedChart = memo(({ data, renderItem, height = 400, itemHeight = 60 }) => {
  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data || [], [data]);

  // Memoized render function
  const MemoizedItem = useCallback(({ index, style }) => {
    const item = memoizedData[index];
    if (!item) return null;

    return (
      <div style={style}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="p-2"
        >
          {renderItem(item, index)}
        </motion.div>
      </div>
    );
  }, [memoizedData, renderItem]);

  if (!memoizedData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={memoizedData.length}
      itemSize={itemHeight}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {MemoizedItem}
    </List>
  );
});

VirtualizedChart.displayName = 'VirtualizedChart';

export default VirtualizedChart;
