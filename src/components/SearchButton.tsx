import { InputText } from "primereact/inputtext";
import React from "react";

interface ISearchButtonProps {
  searchText: string;
  setSearchText: (value: string) => void;
  placeholder: string;
}

const SearchButton = ({
  searchText,
  setSearchText,
  placeholder,
}: ISearchButtonProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value);
  };

  const handleClearSearch = (): void => {
    if (!searchText) return;

    setSearchText("");
  };

  return (
    <div className="form-group search">
      <i className="icon-search" />

      <InputText
        className="form-control"
        placeholder={placeholder}
        value={searchText?.trimStart()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onChange={handleSearchChange}
      // onPaste={(e) => e.preventDefault()}
      // onCopy={(e) => e.preventDefault()}
      // onCut={(e) => e.preventDefault()}
      />

      {searchText && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          <i className="pi pi-times clear-icon-btn" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SearchButton;
