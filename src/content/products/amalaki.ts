export type AmalakiMarket = 'CO' | 'US' | 'UNKNOWN';
export type AmalakiRole = 'CLIENT_VIP' | 'AMBASSADOR';
export type ReviewStatus = 'APPROVED_FOR_MARKET' | 'REVIEW_REQUIRED' | 'EXCLUDED';

export type AmalakiIngredient = { name: string; what: string; why: string; evidence: string; source: string; reviewStatus: ReviewStatus };
export type AmalakiFaq = { question: string; answer: string; reviewStatus: ReviewStatus };
export type AmalakiClaim = { title: string; body: string; reviewStatus: ReviewStatus; source: string };

export type ProductContent = {
  productId: string;
  markets: AmalakiMarket[];
  common: { name: string; identity: string; shortExplanation: string; quickExplanation: string; fullExplanation: string; images: { src: string; alt: string }[]; ingredients: AmalakiIngredient[] };
  marketContent: { market: AmalakiMarket; marketLabel: string; presentation: string; heroFacts: { value: string; label: string }[]; nutrition: { value: string; label: string }[]; usage: string[]; precautions: string[]; claims: AmalakiClaim[]; faqs: AmalakiFaq[]; regulatory: string[]; resources: string[] };
  ambassador: { shortPitch: string; explanation: string; listeningQuestions: string[]; interestConnections: { title: string; body: string }[]; avoid: string[]; roleplay: { title: string; prompt: string; answer: string; feedback: string }[] };
  provenance: { field: string; source: string; market: AmalakiMarket; reviewStatus: ReviewStatus }[];
};

export type AmalakiContent = ProductContent & {
  market: AmalakiMarket; marketLabel: string; description: string; shortExplanation: string; heroFacts: { value: string; label: string }[]; usage: string[]; benefits: AmalakiClaim[]; nutrition: { value: string; label: string }[]; ingredients: AmalakiIngredient[]; precautions: string[]; faqs: AmalakiFaq[];
};

const sourcePrompt = 'Inventario editorial del brief Amalaki V1.2; falta etiqueta/ficha primaria en el repositorio';
const sourceRepository = 'Repositorio Elite Focus (sin ficha primaria adicional)';

const ingredients: AmalakiIngredient[] = [
  { name: 'Amla', what: 'Fruta de Phyllanthus emblica, también llamada amalaki o grosella india.', why: 'Es el ingrediente que da nombre e identidad a la mezcla.', evidence: 'Su presencia está incluida en el inventario de ingredientes; no demuestra por sí sola un beneficio del producto terminado.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Tulsi', what: 'Planta aromática conocida como albahaca sagrada (Ocimum tenuiflorum).', why: 'Forma parte de los extractos vegetales documentados para la fórmula.', evidence: 'Se puede describir su identidad botánica y presencia; no se publica un efecto clínico del producto a partir de ella.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Jengibre', what: 'Rizoma de Zingiber officinale usado como ingrediente vegetal.', why: 'Está incluido entre los componentes documentados de Amalaki.', evidence: 'La presencia del ingrediente está documentada; no se infiere una indicación terapéutica.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Haritaki', what: 'Fruto de Terminalia chebula, usado tradicionalmente en preparaciones ayurvédicas.', why: 'Integra la combinación botánica informada para la fórmula.', evidence: 'El contexto tradicional no equivale a evidencia del producto final ni a una promesa de salud.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Schizandra', what: 'Fruto de Schisandra chinensis, una planta trepadora de origen asiático.', why: 'Es uno de los ingredientes vegetales documentados en Amalaki.', evidence: 'Se comunica como componente; no se publica un claim clínico sin soporte específico del producto.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Jujube', what: 'Fruto de Ziziphus jujuba, también conocido como azufaifa.', why: 'Forma parte de la mezcla de frutas y extractos vegetales documentada.', evidence: 'La fuente disponible permite describir su presencia, no atribuir resultados terapéuticos.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
  { name: 'Uva', what: 'Fruto de Vitis vinifera.', why: 'Está incluido entre los componentes vegetales informados.', evidence: 'La ficha editorial documenta el ingrediente; la cantidad y forma exacta requieren etiqueta.', source: sourcePrompt, reviewStatus: 'REVIEW_REQUIRED' },
  { name: 'Remolacha', what: 'Raíz de Beta vulgaris.', why: 'Es uno de los ingredientes vegetales listados para la mezcla.', evidence: 'La presencia está documentada; la cantidad y función tecnológica requieren la etiqueta primaria.', source: sourcePrompt, reviewStatus: 'REVIEW_REQUIRED' },
  { name: 'Inulina', what: 'Fibra soluble de origen vegetal.', why: 'Aparece como componente de la formulación y ayuda a explicar parte de la fibra declarada.', evidence: 'Se documenta su presencia; no se equipara automáticamente la fibra declarada con un efecto clínico.', source: sourcePrompt, reviewStatus: 'APPROVED_FOR_MARKET' },
];

const commonFaqs = (market: AmalakiMarket): AmalakiFaq[] => [
  { question: '¿Qué es Amalaki?', answer: 'Es una mezcla en polvo de amla, frutas y extractos vegetales, presentada en sobres individuales para preparar con agua.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Cómo se prepara?', answer: 'Mezcla un sobre de 7,2 g con aproximadamente 240 ml de agua.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Cuántas veces al día se toma?', answer: 'La indicación documentada es un sobre una vez al día.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Cuánto dura un envase?', answer: 'Contiene 30 sobres; con un sobre diario, son 30 días de uso.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Qué es la amla?', answer: 'Amla, o amalaki, es el fruto de Phyllanthus emblica y el ingrediente que da nombre al producto.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Contiene azúcar?', answer: market === 'CO' ? 'La ficha revisada registra 0,6 g de azúcares por porción, pero la distinción entre azúcares totales y añadidos debe comprobarse contra la etiqueta exacta.' : 'La ficha de Estados Unidos disponible en el brief no confirma una cifra de azúcares; no publicamos una conclusión adicional.', reviewStatus: 'REVIEW_REQUIRED' },
  { question: '¿Contiene edulcorantes?', answer: market === 'CO' ? 'La documentación revisada menciona sucralosa y alulosa. La formulación y su declaración final deben contrastarse con la etiqueta primaria.' : 'La ficha estadounidense disponible menciona sucralosa y alulosa; la declaración final debe contrastarse con la etiqueta primaria.', reviewStatus: 'REVIEW_REQUIRED' },
  { question: '¿Es apto para veganos?', answer: 'La documentación disponible para esta presentación registra sello Vegan Friendly.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Cómo debe almacenarse?', answer: 'Guárdalo en un lugar fresco y seco, preferiblemente por debajo de 22 °C.', reviewStatus: 'APPROVED_FOR_MARKET' },
  { question: '¿Puede tratar una enfermedad?', answer: 'No debe presentarse como tratamiento. Si tienes una condición médica, estás embarazada, amamantando o tomas medicamentos, consulta a un profesional de salud.', reviewStatus: market === 'US' ? 'APPROVED_FOR_MARKET' : 'REVIEW_REQUIRED' },
];

const marketData: Record<AmalakiMarket, ProductContent['marketContent']> = {
  CO: {
    market: 'CO', marketLabel: 'Colombia', presentation: '30 sobres individuales de 7,2 g; contenido total 216 g.',
    heroFacts: [{ value: '30 sobres', label: 'por envase' }, { value: '7,2 g', label: 'por sobre' }, { value: '216 g', label: 'contenido total' }],
    nutrition: [{ value: '18 kcal', label: 'por porción' }, { value: '6 g', label: 'carbohidratos' }, { value: '3 g', label: 'fibra dietaria' }, { value: '100 mg', label: 'potasio' }, { value: '0,90 mg', label: 'hierro' }, { value: '5 mg', label: 'sodio' }, { value: '0 g', label: 'grasa y proteína' }],
    usage: ['Abre un sobre de 7,2 g.', 'Mézclalo con aproximadamente 240 ml de agua.', 'Tómalo una vez al día.'],
    precautions: ['No se presenta como medicamento ni como tratamiento de enfermedades.', 'Conserva el producto en un lugar fresco y seco, preferiblemente por debajo de 22 °C.', 'La cifra de 0,6 g de azúcares y la distinción entre azúcares totales y añadidos requieren comprobación contra la etiqueta exacta.'],
    claims: [
      { title: 'Fibra declarada', body: 'Aporta 3 g de fibra dietaria por porción, según la ficha revisada.', reviewStatus: 'APPROVED_FOR_MARKET', source: sourcePrompt },
      { title: 'Composición vegetal', body: 'Incluye amla, frutas y extractos vegetales documentados en la ficha editorial.', reviewStatus: 'APPROVED_FOR_MARKET', source: sourcePrompt },
      { title: 'Antioxidantes, digestión, inmunidad y vitalidad', body: 'Aparecen en materiales promocionales previos, pero no se publican sin revisión de sustento y cumplimiento.', reviewStatus: 'EXCLUDED', source: sourceRepository },
    ],
    faqs: commonFaqs('CO'), regulatory: ['Registro sanitario documentado: INVIMA RSA-0034151-2024.', 'Sello Vegan Friendly documentado.', 'Etiquetado frontal sobre azúcares y edulcorantes documentado; revisar etiqueta primaria antes de ampliar el texto.'], resources: [sourcePrompt],
  },
  US: {
    market: 'US', marketLabel: 'Estados Unidos', presentation: '30 sobres individuales de 7,2 g; contenido total documentado de 216 g.',
    heroFacts: [{ value: '30 sobres', label: 'por envase' }, { value: '7,2 g', label: 'por sobre' }, { value: '216 g', label: 'contenido documentado' }],
    nutrition: [{ value: '25 cal', label: 'por porción' }, { value: '5 g', label: 'carbohidratos' }, { value: '3 g', label: 'fibra' }, { value: '5 mg', label: 'sodio' }, { value: '0,9 mg', label: 'hierro' }, { value: '100 mg', label: 'potasio' }],
    usage: ['Abre un sobre.', 'Mézclalo con aproximadamente 240 ml de agua.', 'Tómalo una vez al día.'],
    precautions: ['No se presenta como medicamento ni como tratamiento de enfermedades.', 'La documentación estadounidense incluye advertencias específicas para menores de 18 años y para embarazo o lactancia; revisa el etiquetado de esa presentación antes de usarlo.'],
    claims: [
      { title: 'Fibra declarada', body: 'Aporta 3 g de fibra por porción, según la ficha revisada.', reviewStatus: 'APPROVED_FOR_MARKET', source: sourcePrompt },
      { title: 'Composición vegetal', body: 'Incluye los ingredientes vegetales documentados para Amalaki.', reviewStatus: 'APPROVED_FOR_MARKET', source: sourcePrompt },
      { title: 'Antioxidantes, digestión, inmunidad, vitalidad y bienestar cardiovascular', body: 'Aparecen como enfoques en flyers, pero no se publican sin revisión específica de sustento y cumplimiento para Estados Unidos.', reviewStatus: 'EXCLUDED', source: sourceRepository },
    ],
    faqs: commonFaqs('US'), regulatory: ['La ficha estadounidense consultada incluye advertencias para menores de 18 años y embarazo/lactancia.', 'No se publica un registro sanitario estadounidense porque no existe una fuente primaria en el repositorio.'], resources: [sourcePrompt],
  },
  UNKNOWN: { market: 'UNKNOWN', marketLabel: 'Mercado por confirmar', presentation: 'La presentación específica se muestra después de elegir un mercado.', heroFacts: [], nutrition: [], usage: [], precautions: [], claims: [], faqs: [], regulatory: [], resources: [] },
};

const common: ProductContent['common'] = {
  name: 'Amalaki Original, Zilis', identity: 'Mezcla en polvo de amla, frutas y extractos vegetales para preparar con agua.',
  shortExplanation: 'Amalaki es una mezcla en polvo de amla, frutas y extractos vegetales, presentada en sobres individuales para preparar con agua.',
  quickExplanation: 'Amalaki combina amla, una fruta conocida por su uso tradicional en Ayurveda, con ingredientes vegetales como tulsi, jengibre, uva y remolacha. Se presenta en sobres individuales que mezclas con agua una vez al día. Cada envase contiene 30 sobres, lo que facilita medir una porción diaria.',
  fullExplanation: 'Amla, también llamada amalaki, es el fruto de Phyllanthus emblica y da nombre a la mezcla. En el contexto ayurvédico se ha utilizado tradicionalmente, pero ese contexto no demuestra por sí solo un beneficio del producto terminado. La fórmula también incluye tulsi, jengibre, haritaki, schizandra, jujube, uva, remolacha e inulina, además de otros componentes que deben leerse en la etiqueta correspondiente. Amalaki se presenta en sobres individuales de polvo; la preparación documentada es mezclar un sobre con aproximadamente 240 ml de agua una vez al día. La información nutricional, las advertencias y la documentación sanitaria cambian según el mercado seleccionado.',
  images: [{ src: '/catalog/amalaki-product.png', alt: 'Envase de Amalaki Original' }], ingredients,
};

function ambassador(market: AmalakiMarket): ProductContent['ambassador'] {
  const label = market === 'CO' ? 'Colombia' : market === 'US' ? 'Estados Unidos' : 'el mercado seleccionado';
  return {
    shortPitch: common.shortExplanation,
    explanation: `${common.quickExplanation} Si compartes datos de nutrición, precauciones o documentación, confirma que corresponden a ${label}.`,
    listeningQuestions: ['¿Qué quieres conocer primero: ingredientes, preparación o información nutricional?', '¿Qué esperas encontrar en un producto que vas a incorporar a tu rutina?', '¿Hay alguna condición de salud, medicamento o etapa de embarazo/lactancia que debamos considerar antes de hablar de uso?'],
    interestConnections: [{ title: 'Si pregunta qué es', body: 'Usa la explicación en una frase y después pregunta qué parte quiere conocer.' }, { title: 'Si pregunta cómo se usa', body: 'Indica un sobre de 7,2 g, aproximadamente 240 ml de agua y una vez al día.' }, { title: 'Si pregunta por nutrición', body: `Comparte solo la tabla de ${label}; las calorías y cantidades no son iguales entre mercados.` }, { title: 'Si pregunta por salud', body: 'Explica el límite: no es un tratamiento y las condiciones médicas deben revisarse con un profesional.' }],
    avoid: ['Prometer curación o resultados garantizados.', 'Diagnosticar o recomendar cambios en medicamentos.', 'Atribuir al producto final los efectos estudiados de un ingrediente aislado.', 'Usar cifras, advertencias o claims de otro mercado.', 'Presentar un flyer promocional como autorización sanitaria.'],
    roleplay: [{ title: 'Qué es', prompt: 'La persona pregunta: “¿Qué es Amalaki?”', answer: common.shortExplanation, feedback: 'La respuesta identifica el producto sin convertir sus ingredientes en promesas clínicas.' }, { title: 'Uso', prompt: 'La persona pregunta: “¿Cómo se prepara y cuánto dura?”', answer: 'Un sobre de 7,2 g con aproximadamente 240 ml de agua, una vez al día; 30 sobres equivalen a 30 días de uso.', feedback: 'Compartiste una instrucción concreta y verificable.' }, { title: 'Mercado', prompt: `La persona pregunta por las calorías de la presentación de ${label}.`, answer: market === 'CO' ? '18 kcal por porción.' : market === 'US' ? '25 calorías por porción.' : 'Primero confirmaría el mercado; no elegiría una cifra por defecto.', feedback: 'La cifra depende de la presentación consultada.' }, { title: 'Límite', prompt: 'La persona pregunta si puede usarlo con una enfermedad o medicamento.', answer: 'No diagnosticar ni prometer. Compartir la advertencia aplicable y recomendar consultar a un profesional de salud.', feedback: 'Poner un límite claro protege a la persona y mantiene la conversación responsable.' }],
  };
}

function makeContent(market: AmalakiMarket): AmalakiContent {
  const data = marketData[market];
  const product: ProductContent = { productId: 'AMALAKI', markets: ['CO', 'US'], common, marketContent: data, ambassador: ambassador(market), provenance: [{ field: 'presentation', source: sourcePrompt, market, reviewStatus: market === 'UNKNOWN' ? 'REVIEW_REQUIRED' : 'APPROVED_FOR_MARKET' }, { field: 'nutrition', source: sourcePrompt, market, reviewStatus: market === 'UNKNOWN' ? 'REVIEW_REQUIRED' : 'APPROVED_FOR_MARKET' }, { field: 'claims', source: sourceRepository, market, reviewStatus: 'REVIEW_REQUIRED' }] };
  return { ...product, market, marketLabel: data.marketLabel, description: common.identity, shortExplanation: common.shortExplanation, heroFacts: data.heroFacts, usage: data.usage, benefits: data.claims, nutrition: data.nutrition, ingredients: common.ingredients, precautions: data.precautions, faqs: data.faqs };
}

export const amalakiContent: Record<AmalakiMarket, AmalakiContent> = { CO: makeContent('CO'), US: makeContent('US'), UNKNOWN: makeContent('UNKNOWN') };

export function getAmalakiMarket(market?: string | null, country?: string | null): AmalakiMarket {
  const value = `${market ?? ''} ${country ?? ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
  if (/(^|[^A-Z])(US|USA|UNITED STATES|ESTADOS UNIDOS)([^A-Z]|$)/.test(value)) return 'US';
  if (/(^|[^A-Z])(CO|COL|COLOMBIA)([^A-Z]|$)/.test(value)) return 'CO';
  return 'UNKNOWN';
}

export function getAmalakiContent(market?: string | null, country?: string | null): AmalakiContent { return amalakiContent[getAmalakiMarket(market, country)]; }
