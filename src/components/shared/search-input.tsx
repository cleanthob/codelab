import { Input } from "../ui/input";

export const SearchInput = () => {
  return (
    <div className="flex-1 max-w-[400px] relative">
      <Input className="h-9" placeholder="Buscar um curso" />
    </div>
  );
};
