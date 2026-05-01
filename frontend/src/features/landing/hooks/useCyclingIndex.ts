/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";

/**
 * Auto-cycles through indices 0 → length-1 at a fixed interval.
 * @param length     Number of items to cycle through.
 * @param intervalMs Duration between steps in milliseconds (default: 4000).
 */
export function useCyclingIndex(length: number, intervalMs = 4000): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return index;
}
