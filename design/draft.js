import snapshot from '../assets/drafts/draft-1.json';
export const draft=snapshot;
export const draftStorageKey='hoea-design-studio-draft-1';
export const appearanceStorageKey='hoea-appearance-draft-1';
export const draftChoices=()=>({...draft.effectiveChoices,...Object.fromEntries(Object.entries(draft.effectiveColourOverrides).map(([key,value])=>[`colour:${key}`,value])),motion:draft.motionEnabled,details:true});
