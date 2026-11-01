/** Vibe Design System 3.0 — Clay & Oat.
 * Restrained terracotta for actions, near-white oat surfaces, warm neutral text.
 * Keep the legacy "violet"/"purple" tokens as aliases so the whole frontend
 * switches palettes without changing component behavior or navigation.
 */
export const Colors = {
 background:'#FBF8F4',
 backgroundAlt:'#F7F0EA',
 card:'#FFFFFF',
 cardSoft:'#F9F1EA',
 panel:'#FFFFFF',
 text:'#302621',
 muted:'#76665E',
 subtle:'#9B8D84',
 lime:'#385A3F',
 limeSoft:'#DFE8D8',
 violet:'#A35640',
 purple:'#9A503C',
 clay:'#B96852',
 oat:'#FBF8F4',
 sand:'#F3E2D7',
 sage:'#DFE8D8',
 mint:'#526E57',
 rose:'#B45F5B',
 orange:'#A06439',
 border:'rgba(98,69,48,0.13)',
 success:'#3F7450',
 warning:'#8B6032',
 danger:'#B33D4F',
};
export const Spacing={xs:8,sm:12,md:16,lg:20,xl:24,xxl:32,xxxl:40};
export const Radius={sm:12,md:18,lg:24,xl:30,pill:999};
export const Type={hero:35,title:29,section:21,body:14,small:12,caption:11};
export const Gradients={
 // Darker for welcome hero where copy is white.
 hero:['#874438','#A9614B','#BF8971'] as const,
 nightlife:['#644C47','#AA796E'] as const,
 cafe:['#A07C63','#DBC1A9'] as const,
 restaurant:['#956553','#C89379'] as const,
 // Extremely subtle accents on light surfaces.
 secondary:['#FBF3EC','#F7E8E2'] as const,
 vibe:['#A35640','#C18A70'] as const,
};
