"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";

export const SearchInput = () => {
  const [value, setValue] = useState("");

  return (
    <div className="flex-1 max-w-[400px] relative">
      <Input
        className="h-9 pl-9 peer"
        placeholder="Buscar um curso"
        value={value}
        onChange={({ target }) => setValue(target.value)}
      />
      <Search
        className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground peer-focus:text-primary transition-all"
        size={16}
      />
    </div>
  );
};
