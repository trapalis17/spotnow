/** Vibe Design System 4.0 — Digital Lavender with selective gradients.
 * Previous violet/purple aliases remain for compatibility with existing screens.
 * Deep violet is used for readable text; light lavender is reserved for visuals.
 */
export const Colors={
 background:'#FAF8FF',backgroundAlt:'#F6F2FF',card:'#FFFFFF',cardSoft:'#F4F0FF',panel:'#FFFFFF',
 text:'#29243C',muted:'#6F6885',subtle:'#938CA7',
 violet:'#5B47D6',purple:'#5942C1',lavender:'#8B7CFF',lilac:'#EAE2FC',pink:'#F3D6FF',
 lime:'#506B35',limeSoft:'#DDF3B2',mint:'#44766A',rose:'#C75D93',orange:'#976B40',
 border:'rgba(91,71,214,0.12)',success:'#2C7C5C',warning:'#936A2D',danger:'#C54575',
};
export const Spacing={xs:8,sm:12,md:16,lg:20,xl:24,xxl:32,xxxl:40};
export const Radius={sm:12,md:18,lg:24,xl:30,pill:999};
export const Type={hero:35,title:29,section:21,body:14,small:12,caption:11};
export const Gradients={
 hero:['#5847C9','#7B63DC','#A58EE9'] as const,
 primary:['#614BCF','#9279EC'] as const,
 nightlife:['#4F4694','#8D7ABF'] as const,
 cafe:['#7264B7','#BBA7D9'] as const,
 restaurant:['#9072BE','#C6ACDF'] as const,
 secondary:['#F2EEFF','#FBF4FF'] as const,
 soft:['#F8F5FF','#FDFBFF'] as const,
 vibe:['#614BCF','#9D83E8'] as const,
 glow:['#A88BFF','#F3D6FF'] as const,
};
