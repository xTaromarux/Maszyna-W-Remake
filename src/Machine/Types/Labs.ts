export interface Lab {
  id: string;
  titleKey: string;
  descriptionKey: string;
  outcomesKeys: string[];
  pythonOverview: string;
  asmStub: string;
  [key: string]: string | string[];
}

export interface LocalizedLab extends Lab {
  title: string;
  description: string;
  outcomes: string[];
}
