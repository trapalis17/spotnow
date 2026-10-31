import type { PlaceMatch } from './place-intelligence';

/** Stored feedback contains only the user's decision and Google Place IDs, not Google venue content. */
export type SwipeDecision = 'like' | 'pass';
export type SwipeFeedback = Record<string, SwipeDecision>;

/** Works on the CURRENT live Places results. It never stores Google categories or tags.
 * Like-patterns increase affinity with similar places; repeated passes slightly lower affinity.
 * A single pass never suppresses every café/bar/resto in a category.
 */
export function personalizeMatches(matches: PlaceMatch[], feedback: SwipeFeedback): PlaceMatch[] {
  const liked = matches.filter(item => feedback[item.place.id] === 'like');
  const passed = matches.filter(item => feedback[item.place.id] === 'pass');
  const scoreItem = (item: PlaceMatch) => {
    let adjustment = feedback[item.place.id] === 'like' ? 12 : 0;
    if (feedback[item.place.id] === 'pass') adjustment -= 45;
    for (const other of liked) {
      if (other.place.id === item.place.id) continue;
      if (other.place.category === item.place.category) adjustment += 9;
      const overlap = item.vibe.tags.filter(tag => other.vibe.tags.includes(tag)).length;
      adjustment += Math.min(14, overlap * 4);
    }
    // Negative signals require at least two examples in the same category, not one.
    const passesInCategory = passed.filter(p => p.place.category === item.place.category).length;
    if (passesInCategory >= 2 && feedback[item.place.id] !== 'like') {
      adjustment -= Math.min(12, (passesInCategory - 1) * 4);
    }
    return item.score + Math.min(28, Math.max(-50, adjustment));
  };
  return [...matches].sort((a,b) => scoreItem(b)-scoreItem(a)
    || a.place.name.localeCompare(b.place.name)).map(item=>{
      const adjustment = scoreItem(item)-item.score;
      const likedSimilar = adjustment > 0 && feedback[item.place.id] !== 'like';
      return {...item,score:Math.max(0,Math.min(100,Math.round(scoreItem(item)))),
        reasons: likedSimilar
          ? ['Παρόμοιο με μαγαζιά που σου άρεσαν',...item.reasons].slice(0,3)
          : item.reasons};
    });
}

export function pendingSwipeMatches(matches: PlaceMatch[], feedback: SwipeFeedback): PlaceMatch[] {
  return matches.filter(({place}) => !feedback[place.id]);
}
