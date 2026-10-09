import { IGetWhiteLabelSettingsByUserIdResponseData, IWhiteLabelPermission } from "../../interface/whiteLabel";
import { IDomainConfigurationResponseData, IDomainConfigurationWhiteLabelSettings } from "../../interface/publicToken";
import { StorageKeyEnum } from "../constants/enum";
import {
  getDecryptedSessionStorage,
  removeSessionStorageKey,
  setEncryptedSessionStorage,
} from "./sessionStorage";

const DEFAULT_PRIMARY_COLOR = "#0d8dc9";
const DEFAULT_SECONDARY_COLOR = "#96999b";
const DEFAULT_ACCENT_COLOR = "#0d8dc933";
const DEFAULT_SIDEBAR_LOGO = "/assets/images/logo.jpg";
const DEFAULT_FAVICON = "/assets/images/favicon.webp";
const DEFAULT_TITLE = "Schofee - Smart Education Finance Platform";
const DEFAULT_DESCRIPTION =
  "Access course financing, student loan workflows, and secure education finance services with Schofee.";
const WHITE_LABEL_PREVIEW_EVENT = "white-label-preview-updated";
const WHITE_LABEL_SETTINGS_UPDATED_EVENT = "white-label-settings-updated";

const normalizeHex = (value: string | null | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const sanitized = hex.replace("#", "");

  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;

const mixWith = (hex: string, mixHex: string, amount: number): string => {
  const base = hexToRgb(hex);
  const mix = hexToRgb(mixHex);

  return rgbToHex(
    base.r + (mix.r - base.r) * amount,
    base.g + (mix.g - base.g) * amount,
    base.b + (mix.b - base.b) * amount,
  );
};

const withAlpha = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(normalizedAlpha * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}${alphaHex}`;
};

const setRootVariable = (name: string, value: string): void => {
  document.documentElement.style.setProperty(name, value);
};

const updateFavicon = (faviconUrl: string): void => {
  const normalizedFaviconUrl = faviconUrl.includes("?")
    ? `${faviconUrl}&v=${Date.now()}`
    : `${faviconUrl}?v=${Date.now()}`;

  const faviconSelectors = [
    "link[rel='icon']",
    "link[rel='shortcut icon']",
    "link[rel='apple-touch-icon']",
  ];

  faviconSelectors.forEach((selector) => {
    const existingFavicon = document.querySelector(selector) as HTMLLinkElement | null;

    if (existingFavicon) {
      existingFavicon.href = normalizedFaviconUrl;
      existingFavicon.type = normalizedFaviconUrl.toLowerCase().includes(".webp")
        ? "image/x-icon"
        : "image/png";
    }
  });

  if (!document.querySelector("link[rel='icon']")) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = normalizedFaviconUrl.toLowerCase().includes(".webp")
      ? "image/x-icon"
      : "image/png";
    favicon.href = normalizedFaviconUrl;
    document.head.appendChild(favicon);
  }
};

const upsertMetaContent = (
  selector: string,
  attributeName: "name" | "property",
  attributeValue: string,
  content: string,
): void => {
  let element = document.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const updateDocumentMetadata = (
  settings?: IGetWhiteLabelSettingsByUserIdResponseData | null,
): void => {
  const canApply = shouldApplyWhiteLabelBranding(settings);
  const title = DEFAULT_TITLE;
  const description = DEFAULT_DESCRIPTION;
  const themeColor = canApply
    ? normalizeHex(settings?.primaryColor, DEFAULT_PRIMARY_COLOR)
    : DEFAULT_PRIMARY_COLOR;

  document.title = title;

  upsertMetaContent(
    "meta[name='description']",
    "name",
    "description",
    description,
  );
  upsertMetaContent(
    "meta[name='theme-color']",
    "name",
    "theme-color",
    themeColor,
  );
  upsertMetaContent(
    "meta[property='og:title']",
    "property",
    "og:title",
    title,
  );
  upsertMetaContent(
    "meta[property='og:description']",
    "property",
    "og:description",
    description,
  );
  upsertMetaContent(
    "meta[name='twitter:title']",
    "name",
    "twitter:title",
    title,
  );
  upsertMetaContent(
    "meta[name='twitter:description']",
    "name",
    "twitter:description",
    description,
  );
};

const emitPreviewChange = (): void => {
  window.dispatchEvent(new Event(WHITE_LABEL_PREVIEW_EVENT));
};

export const getWhiteLabelPreviewSettings = (): IGetWhiteLabelSettingsByUserIdResponseData | null => {
  const storedPreview = getDecryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_WHITE_LABEL_PREVIEW,
  );

  if (!storedPreview) return null;

  if (typeof storedPreview === "string") {
    try {
      return JSON.parse(storedPreview) as IGetWhiteLabelSettingsByUserIdResponseData;
    } catch {
      return null;
    }
  }

  return storedPreview as IGetWhiteLabelSettingsByUserIdResponseData;
};

export const setWhiteLabelPreviewSettings = (
  settings: IGetWhiteLabelSettingsByUserIdResponseData,
): void => {
  const isStored = setEncryptedSessionStorage(
    StorageKeyEnum.CRED_ORBIT_WHITE_LABEL_PREVIEW,
    JSON.stringify(settings),
  );

  if (!isStored) {
    throw new Error(
      "Preview assets are too large for browser storage. Please use a smaller logo or favicon.",
    );
  }

  emitPreviewChange();
};

export const clearWhiteLabelPreviewSettings = (): void => {
  removeSessionStorageKey(StorageKeyEnum.CRED_ORBIT_WHITE_LABEL_PREVIEW);
  emitPreviewChange();
};

export const subscribeWhiteLabelPreviewChange = (
  callback: () => void,
): (() => void) => {
  window.addEventListener(WHITE_LABEL_PREVIEW_EVENT, callback);

  return () => window.removeEventListener(WHITE_LABEL_PREVIEW_EVENT, callback);
};

export const emitWhiteLabelSettingsUpdated = (
  whiteLabelUserId: string,
): void => {
  window.dispatchEvent(
    new CustomEvent<string>(WHITE_LABEL_SETTINGS_UPDATED_EVENT, {
      detail: whiteLabelUserId,
    }),
  );
};

export const subscribeWhiteLabelSettingsUpdated = (
  callback: (whiteLabelUserId: string) => void,
): (() => void) => {
  const handler = (event: Event): void => {
    const customEvent = event as CustomEvent<string>;
    callback(customEvent.detail);
  };

  window.addEventListener(WHITE_LABEL_SETTINGS_UPDATED_EVENT, handler);

  return () =>
    window.removeEventListener(WHITE_LABEL_SETTINGS_UPDATED_EVENT, handler);
};

export const shouldApplyWhiteLabelBranding = (
  settings?: IWhiteLabelPermission | IGetWhiteLabelSettingsByUserIdResponseData | null,
): boolean => {
  if (!settings) return false;

  const permission =
    "whiteLabelPermission" in settings
      ? settings.whiteLabelPermission
      : settings;

  return Boolean(permission?.isFeatureActive && permission?.isUIEnable);
};

export const applyWhiteLabelBranding = (
  settings?: IGetWhiteLabelSettingsByUserIdResponseData | null,
): void => {
  const canApply = shouldApplyWhiteLabelBranding(settings);

  const primaryColor = canApply
    ? normalizeHex(settings?.primaryColor, DEFAULT_PRIMARY_COLOR)
    : DEFAULT_PRIMARY_COLOR;

  const secondaryColor = canApply
    ? normalizeHex(settings?.secondaryColor, DEFAULT_SECONDARY_COLOR)
    : DEFAULT_SECONDARY_COLOR;

  const accentColor = canApply
    ? normalizeHex(settings?.accentColor, DEFAULT_ACCENT_COLOR)
    : DEFAULT_ACCENT_COLOR;

  // setRootVariable("--color-brand-primary", primaryColor);

  // setRootVariable("--color-brand-primary-soft", mixWith(primaryColor, "#ffffff", 0.92));

  // setRootVariable("--color-brand-primary-soft-alt", mixWith(primaryColor, "#ffffff", 0.88));

  // setRootVariable("--color-brand-primary-soft-strong", mixWith(primaryColor, "#ffffff", 0.84));

  // setRootVariable("--color-brand-primary-surface", mixWith(primaryColor, "#ffffff", 0.94));

  // setRootVariable("--color-brand-primary-surface-alt", mixWith(primaryColor, "#ffffff", 0.97));

  // setRootVariable("--color-brand-primary-border", mixWith(primaryColor, "#ffffff", 0.72));

  // setRootVariable("--color-brand-primary-border-strong", mixWith(primaryColor, "#ffffff", 0.5));

  // setRootVariable("--color-brand-primary-shadow", withAlpha(primaryColor, 0.28));

  // setRootVariable("--color-brand-primary-glow", withAlpha(primaryColor, 0.4));

  // setRootVariable("--color-brand-primary-glow-strong", withAlpha(primaryColor, 0.5));

  // setRootVariable("--color-brand-primary-shadow-soft", withAlpha(primaryColor, 0.14));

  // setRootVariable("--color-brand-primary-shadow-medium", withAlpha(primaryColor, 0.2));

  // setRootVariable("--color-brand-primary-shadow-strong", withAlpha(primaryColor, 0.35));

  // setRootVariable("--color-brand-primary-muted", mixWith(primaryColor, secondaryColor, 0.45));

  // setRootVariable("--color-brand-primary-muted-deep", mixWith(primaryColor, "#000000", 0.4));

  // setRootVariable("--color-brand-primary-soft-hover", mixWith(primaryColor, "#ffffff", 0.8));

  // setRootVariable("--color-text-primary", secondaryColor);

  // setRootVariable("--color-text-primary-20", withAlpha(secondaryColor, 0.2));

  // setRootVariable("--color-text-primary-40", withAlpha(secondaryColor, 0.4));

  // setRootVariable("--bs-primary", primaryColor);

  // setRootVariable("--bs-link-color", primaryColor);

  // setRootVariable("--bs-link-hover-color", primaryColor);

  // setRootVariable("--bs-body-color", secondaryColor);

  // setRootVariable("--primary-color", primaryColor);

  // setRootVariable("--text-color", secondaryColor);

  // setRootVariable("--bs-body-color", secondaryColor);

  // setRootVariable("--bs-table-header", accentColor);

  updateFavicon(DEFAULT_FAVICON);

  updateDocumentMetadata(settings);
};

export const getWhiteLabelLogoUrl = (
  settings: IGetWhiteLabelSettingsByUserIdResponseData | null | undefined,
  variant: "sidebar" | "public",
): string => {
  if (
    shouldApplyWhiteLabelBranding(settings) &&
    settings?.isLogoUploaded &&
    settings?.logoUrl
  ) {
    return settings.logoUrl;
  }

  return DEFAULT_SIDEBAR_LOGO;
};

export const mapDomainConfigurationToWhiteLabelSettings = (
  domainConfiguration?: IDomainConfigurationResponseData | null,
): IDomainConfigurationWhiteLabelSettings | null => {
  if (!domainConfiguration?.whiteLabelUserId) {
    return null;
  }

  return {
    id: domainConfiguration.id,
    whiteLabelUserId: domainConfiguration.whiteLabelUserId,
    companyName: domainConfiguration.companyName,
    displayName: domainConfiguration.displayName,
    logoUrl: domainConfiguration.logoUrl,
    faviconUrl: domainConfiguration.faviconUrl,
    logoUrlBase64: domainConfiguration.logoUrlBase64 ?? undefined,
    faviconUrlBase64: domainConfiguration.faviconUrlBase64 ?? undefined,
    primaryColor: domainConfiguration.primaryColor,
    secondaryColor: domainConfiguration.secondaryColor,
    accentColor: domainConfiguration.accentColor,
    fontFamily: domainConfiguration.fontFamily,
    theme: domainConfiguration.theme,
    customCss: domainConfiguration.customCss,
    isLogoUploaded: domainConfiguration.isLogoUploaded,
    isDefault: domainConfiguration.isDefault,
    subDomainURL: domainConfiguration.subDomainUrl,
    subDomainUrl: domainConfiguration.subDomainUrl,
    userType: domainConfiguration.userType,
    userDetails: {
      id: domainConfiguration.whiteLabelUserId,
      fullName: domainConfiguration.displayName || domainConfiguration.companyName || "",
      email: "",
      panNumber: "",
      phoneNumber: "",
      code: "",
    },
    whiteLabelPermission: {
      id: domainConfiguration.id,
      isFeatureActive: true,
      isUIEnable: true,
      isReportPDFEnable: false,
      isReportExcelEnable: false,
      isPayoutInvoiceEnable: false,
      isSubscriptionInvoiceEnable: false,
      isEmailEnable: false,
    },
  };
};
