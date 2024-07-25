type progressDataType = {
  type: string;
  color: string | undefined;
  value: number;
}[];

type TabType = {
  title: string;
  roles: string[];
};

type TabsType = {
  [key: string]: TabType;
};
