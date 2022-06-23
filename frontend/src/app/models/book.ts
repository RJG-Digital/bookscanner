export interface Book {
  author: string;
  description: string;
  fictionNonFiction: string;
  interestLevel: string;
  languageCode: string;
  level: number;
  picture: string;
  points: number;
  quizNumber: number;
  quizTypes: string[];
  series: string[];
  title: string;
  topics: string[];
  wordCount: number;
  isTestTaken?: boolean
}

