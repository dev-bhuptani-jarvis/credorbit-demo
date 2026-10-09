const TRANSPARENT_BACKGROUND = "rgba(0, 0, 0, 0)";
const DEFAULT_TEXT_COLOR = "var(--color-text-heading-muted)";
const LIGHT_TEXT_COLOR = "var(--color-white)";
const DARK_TEXT_COLOR = "var(--color-black)";

const getEffectiveBackgroundColor = (element: HTMLElement): string => {
  const cellStyles = window.getComputedStyle(element);

  if (cellStyles.backgroundColor !== TRANSPARENT_BACKGROUND) {
    return cellStyles.backgroundColor;
  }

  if (element.parentElement) {
    return window.getComputedStyle(element.parentElement).backgroundColor;
  }

  return cellStyles.backgroundColor;
};

export const getContrastTextColor = (backgroundColor: string): string => {
  const rgbMatch = backgroundColor.match(/\d+(\.\d+)?/g);

  if (!rgbMatch || rgbMatch.length < 3) {
    return DEFAULT_TEXT_COLOR;
  }

  const [red, green, blue, alpha] = rgbMatch.map(Number);

  if (alpha === 0) {
    return DEFAULT_TEXT_COLOR;
  }

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.5 ? LIGHT_TEXT_COLOR : DARK_TEXT_COLOR;
};

const applyContrastColorToElements = (
  elements: NodeListOf<HTMLElement> | HTMLElement[],
  textColor: string,
): void => {
  elements.forEach((element) => {
    element.style.color = textColor;
  });
};

const applyContrastForCells = (
  cells: NodeListOf<HTMLTableCellElement>,
  nestedSelector: string,
): void => {
  cells.forEach((cell) => {
    const textColor = getContrastTextColor(getEffectiveBackgroundColor(cell));

    cell.style.color = textColor;
    applyContrastColorToElements(
      cell.querySelectorAll<HTMLElement>(nestedSelector),
      textColor,
    );
  });
};

export const applyTableContrastColors = (
  root: ParentNode = document,
): void => {
  const tables = root.querySelectorAll<HTMLElement>(".tableMain");

  tables.forEach((table) => {
    applyContrastForCells(
      table.querySelectorAll<HTMLTableCellElement>("th"),
      ".p-column-header-content, .p-column-title, span, button, i",
    );

    applyContrastForCells(
      table.querySelectorAll<HTMLTableCellElement>("td"),
      "span, button, i",
    );
  });
};
