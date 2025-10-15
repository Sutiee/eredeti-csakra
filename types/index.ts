/**
 * Global TypeScript Type Definitions
 * Eredeti Csakra - Chakra Analysis Quiz
 */

// Quiz Question Types
export type QuestionOption = {
  label: string;
  score: 1 | 2 | 3 | 4;
};

export type Question = {
  id: string;
  chakra: ChakraName;
  text: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
};

// Chakra Names (Hungarian)
export type ChakraName =
  | "Gyökércsakra"
  | "Szakrális csakra"
  | "Napfonat csakra"
  | "Szív csakra"
  | "Torok csakra"
  | "Harmadik szem"
  | "Korona csakra";

export type ChakraKey =
  | "root"
  | "sacral"
  | "solar"
  | "heart"
  | "throat"
  | "third_eye"
  | "crown";

// Chakra Metadata
export type ChakraMetadata = {
  key: ChakraKey;
  name: ChakraName;
  nameEn: string;
  sanskritName: string;
  color: string;
  position: number; // 1-7 from bottom to top
  element: string;
  location: string;
  description: string;
};

// Score Interpretation Levels
export type InterpretationLevel = "blocked" | "imbalanced" | "balanced";

export type InterpretationData = {
  status: string;
  summary: string;
  manifestations: string[];
  first_aid_plan: string;
};

export type ChakraInterpretations = {
  title: string;
  "4-7": InterpretationData;
  "8-12": InterpretationData;
  "13-16": InterpretationData;
};

// Quiz Results
export type ChakraScore = {
  chakra: ChakraName;
  score: number; // 4-16
  level: InterpretationLevel;
  interpretation: InterpretationData;
};

export type ChakraScores = {
  [key in ChakraName]: number;
};

export type QuizAnswers = [
  number, number, number, number, // Root (1-4)
  number, number, number, number, // Sacral (5-8)
  number, number, number, number, // Solar (9-12)
  number, number, number, number, // Heart (13-16)
  number, number, number, number, // Throat (17-20)
  number, number, number, number, // Third Eye (21-24)
  number, number, number, number  // Crown (25-28)
];

export type UserInfo = {
  full_name: string;
  email: string;
  age?: number;
};

export type QuizSubmission = UserInfo & {
  answers: QuizAnswers;
};

export type QuizResult = {
  id: string;
  name: string;
  email: string;
  age?: number;
  answers: QuizAnswers;
  chakra_scores: ChakraScores;
  created_at: string;
};

export type QuizResultWithInterpretations = QuizResult & {
  interpretations: ChakraScore[];
};

// Personal Fields for Form
export type PersonalField = {
  id: "full_name" | "email" | "age";
  label: string;
  type: "text" | "email" | "number";
  required: boolean;
  min?: number;
  max?: number;
};

// Meditation Access Types
export type MeditationAccess = {
  id: string;
  purchase_id: string;
  email: string;
  access_token: string;
  expires_at: string | null;
  is_active: boolean;
  product_type: 'meditations' | 'bundle';
  access_granted_at: string;
  last_accessed_at: string | null;
  access_count: number;
  created_at: string;
};

// Purchase Types
export type Purchase = {
  id: string;
  result_id: string | null;
  email: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};
