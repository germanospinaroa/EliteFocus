export type AmalakiMarket = 'CO' | 'US' | 'UNKNOWN';
export type AmalakiRole = 'CLIENT_VIP' | 'AMBASSADOR';

export type AmalakiIngredient = {
  name: string;
  what: string;
  why: string;
  context?: string;
};

export type AmalakiContent = {
  market: AmalakiMarket;
  marketLabel: string;
  description: string;
  shortExplanation: string;
  heroFacts: { value: string; label: string }[];
  usage: string[];
  benefits: { title: string; body: string }[];
  nutrition: { value: string; label: string }[];
  ingredients: AmalakiIngredient[];
  precautions: string[];
  faqs: { question: string; answer: string }[];
  ambassador: {
    oneLine: string;
    shortExplanation: string;
    listeningQuestions: string[];
    connections: { title: string; body: string }[];
    avoid: string[];
  };
};

const commonFaqs = [
  { question: '¿Cuántos sobres tomo al día?', answer: 'La preparación indicada para esta experiencia es un sobre al día.' },
  { question: '¿Cómo lo preparo?', answer: 'Abre un sobre y mézclalo con aproximadamente 240 ml de agua.' },
  { question: '¿Cómo lo guardo?', answer: 'Guárdalo en un lugar fresco y seco.' },
  { question: '¿Sirve para tratar una enfermedad?', answer: 'No presentamos Amalaki como tratamiento. Si tienes una condición médica o tomas medicamentos, revisa la información oficial y consulta con un profesional de salud.' },
];

const commonIngredients: AmalakiIngredient[] = [
  { name: 'Amla', what: 'Una fruta también conocida como amalaki.', why: 'Es uno de los componentes centrales de la fórmula.', context: 'Forma parte de la identidad del producto.' },
  { name: 'Tulsi', what: 'Una planta tradicional de origen vegetal.', why: 'Aporta contexto botánico a la fórmula.', context: 'No se presenta aquí como una promesa clínica.' },
  { name: 'Jengibre', what: 'Una raíz utilizada como ingrediente vegetal.', why: 'Está presente como parte del perfil de la fórmula.', context: 'La información se limita a describir su presencia.' },
  { name: 'Haritaki', what: 'Un ingrediente botánico.', why: 'Forma parte de la composición informada para Amalaki.', context: 'No se convierte en una promesa médica.' },
  { name: 'Schizandra', what: 'Un ingrediente de origen vegetal.', why: 'Contribuye a la composición botánica del producto.', context: 'La fuente disponible no respalda claims clínicos en esta experiencia.' },
  { name: 'Inulina', what: 'Un componente de origen vegetal.', why: 'Está presente en la fórmula y ayuda a entender qué contiene el producto.' },
];

const ambassadorLayer = (marketLabel: string) => ({
  oneLine: 'Amalaki es una bebida práctica que combina amla, frutas y extractos vegetales para acompañar una rutina diaria de bienestar.',
  shortExplanation: `Amalaki se prepara con un sobre y agua, y combina amla con ingredientes vegetales para acompañar hábitos cotidianos. La información que compartas debe corresponder al mercado de ${marketLabel}.`,
  listeningQuestions: ['¿Qué estás buscando incorporar a tu rutina?', '¿Qué es importante para ti cuando eliges un producto de bienestar?', '¿Prefieres algo sencillo de incorporar al día a día?'],
  connections: [
    { title: 'Si valora practicidad', body: 'Puedes hablar de los sobres individuales y la preparación sencilla.' },
    { title: 'Si quiere conocer ingredientes', body: 'Muéstrale los componentes principales, sin convertirlos en promesas clínicas.' },
    { title: 'Si pregunta por información nutricional', body: `Comparte únicamente los datos respaldados para ${marketLabel}.` },
    { title: 'Si hace una pregunta médica', body: 'No diagnostiques. Comparte la información disponible y sugiere consultar con un profesional de salud cuando corresponda.' },
  ],
  avoid: ['Te va a curar…', 'Esto te quita…', 'Está garantizado que…', 'En X días vas a sentir…', 'Diagnosticar o recomendar cambios en medicamentos.'],
});

export const amalakiContent: Record<AmalakiMarket, AmalakiContent> = {
  CO: {
    market: 'CO', marketLabel: 'Colombia',
    description: 'Amalaki combina amla con frutas y extractos vegetales en sobres individuales que mezclas con agua una vez al día.',
    shortExplanation: 'Amalaki combina amla, frutas y extractos vegetales en un formato práctico para acompañar una rutina diaria de bienestar.',
    heroFacts: [{ value: '1 sobre', label: 'al día' }, { value: '240 ml', label: 'de agua' }, { value: '30 sobres', label: 'por envase' }],
    usage: ['Abre un sobre.', 'Mézclalo con aproximadamente 240 ml de agua.', 'Tómalo una vez al día.'],
    benefits: [
      { title: 'Bienestar desde adentro', body: 'Una opción sencilla para acompañar tus hábitos cotidianos.' },
      { title: 'Ingredientes vegetales', body: 'Amla, uva, remolacha, tulsi y otros ingredientes vegetales.' },
      { title: 'Practicidad diaria', body: 'Un sobre individual, agua y listo.' },
      { title: 'Fibra e información nutricional', body: 'La porción aporta datos nutricionales concretos para Colombia.' },
      { title: 'Vegan Friendly', body: 'La presentación para Colombia cuenta con sello Vegan Friendly.' },
    ],
    nutrition: [{ value: '3 g', label: 'fibra dietaria por porción' }, { value: '100 mg', label: 'potasio por porción' }, { value: '18 kcal', label: 'por porción preparada' }, { value: '0 g', label: 'grasa' }],
    ingredients: commonIngredients,
    precautions: ['No se presenta como medicamento ni como tratamiento para enfermedades.', 'Si tienes una condición médica, estás embarazada o tomas medicamentos, consulta con un profesional de salud antes de usarlo.', 'La información nutricional corresponde a la presentación de Colombia.'],
    faqs: [...commonFaqs, { question: '¿Tiene azúcar o edulcorantes?', answer: 'La fuente revisada para esta V1 no nos permite publicar una respuesta definitiva sobre este punto.' }, { question: '¿Es apto para veganos?', answer: 'La presentación para Colombia cuenta con sello Vegan Friendly.' }],
    ambassador: ambassadorLayer('Colombia'),
  },
  US: {
    market: 'US', marketLabel: 'Estados Unidos',
    description: 'Amalaki combina amla con frutas y extractos vegetales en sobres individuales que mezclas con agua una vez al día.',
    shortExplanation: 'Amalaki combina amla, frutas y extractos vegetales en un formato práctico para acompañar una rutina diaria de bienestar.',
    heroFacts: [{ value: '1 sobre', label: 'al día' }, { value: '240 ml', label: 'de agua' }, { value: '30 sobres', label: 'por envase' }],
    usage: ['Abre un sobre.', 'Mézclalo con aproximadamente 240 ml de agua.', 'Tómalo una vez al día.'],
    benefits: [
      { title: 'Bienestar desde adentro', body: 'Una opción sencilla para acompañar tus hábitos cotidianos.' },
      { title: 'Ingredientes vegetales', body: 'Amla, frutas y extractos vegetales forman parte de la fórmula.' },
      { title: 'Practicidad diaria', body: 'Un sobre individual, agua y listo.' },
    ],
    nutrition: [],
    ingredients: commonIngredients,
    precautions: ['No se presenta como medicamento ni como tratamiento para enfermedades.', 'Si tienes una condición médica, estás embarazada o tomas medicamentos, consulta con un profesional de salud antes de usarlo.'],
    faqs: commonFaqs,
    ambassador: ambassadorLayer('Estados Unidos'),
  },
  UNKNOWN: {
    market: 'UNKNOWN', marketLabel: 'Mercado por confirmar',
    description: 'Amalaki combina amla con frutas y extractos vegetales en sobres individuales que mezclas con agua una vez al día.',
    shortExplanation: 'Amalaki combina amla, frutas y extractos vegetales en un formato práctico para acompañar una rutina diaria de bienestar.',
    heroFacts: [{ value: '1 sobre', label: 'al día' }, { value: '240 ml', label: 'de agua' }, { value: '30 sobres', label: 'por envase' }],
    usage: ['Abre un sobre.', 'Mézclalo con aproximadamente 240 ml de agua.', 'Tómalo una vez al día.'],
    benefits: [
      { title: 'Bienestar desde adentro', body: 'Una opción sencilla para acompañar tus hábitos cotidianos.' },
      { title: 'Ingredientes vegetales', body: 'Amla, frutas y extractos vegetales forman parte de la fórmula.' },
      { title: 'Practicidad diaria', body: 'Un sobre individual, agua y listo.' },
    ],
    nutrition: [],
    ingredients: commonIngredients,
    precautions: ['No se presenta como medicamento ni como tratamiento para enfermedades.', 'Si tienes una condición médica, estás embarazada o tomas medicamentos, consulta con un profesional de salud antes de usarlo.'],
    faqs: commonFaqs,
    ambassador: ambassadorLayer('el mercado correspondiente'),
  },
};

export function getAmalakiMarket(market?: string | null, country?: string | null): AmalakiMarket {
  const value = `${market ?? ''} ${country ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
  if (/(^|[^A-Z])(US|USA|UNITED STATES|ESTADOS UNIDOS)([^A-Z]|$)/.test(value)) return 'US';
  if (/(^|[^A-Z])(CO|COL|COLOMBIA)([^A-Z]|$)/.test(value)) return 'CO';
  return 'UNKNOWN';
}

export function getAmalakiContent(market?: string | null, country?: string | null): AmalakiContent {
  const resolved = getAmalakiMarket(market, country);
  return amalakiContent[resolved];
}
