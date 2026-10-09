import AppRoutes from "./routes/Router.config";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'primeicons/primeicons.css';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import {
  applyWhiteLabelBranding,
  getWhiteLabelPreviewSettings,
  subscribeWhiteLabelPreviewChange,
} from "./utils/functions/whiteLabelBranding";
import { IGetWhiteLabelSettingsByUserIdResponseData } from "./interface/whiteLabel";
import { applyTableContrastColors } from "./utils/functions/tableContrast";

function App() {
  const whiteLabelSettings = useSelector(
    (state: RootState) => state.user.user.whiteLabelSettings,
  );

  useEffect(() => {
    const applyCurrentBranding = (): void => {
      const previewSettings: IGetWhiteLabelSettingsByUserIdResponseData | null =
        getWhiteLabelPreviewSettings();

      applyWhiteLabelBranding(previewSettings || whiteLabelSettings);
      window.requestAnimationFrame(() => {
        applyTableContrastColors();
      });
    };

    applyCurrentBranding();

    const unsubscribe = subscribeWhiteLabelPreviewChange(applyCurrentBranding);

    return unsubscribe;
  }, [whiteLabelSettings]);

  useEffect(() => {
    let animationFrameId = 0;

    const requiresTableContrastUpdate = (node: Node): boolean => {
      if (!(node instanceof Element)) return false;

      return (
        node.matches(".tableMain") ||
        !!node.closest(".tableMain") ||
        !!node.querySelector(".tableMain")
      );
    };

    const scheduleApplyTableContrastColors = (): void => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(() => {
        applyTableContrastColors();
      });
    };

    scheduleApplyTableContrastColors();

    const observer = new MutationObserver((mutations) => {
      const hasTableChange = mutations.some((mutation) => {
        if (requiresTableContrastUpdate(mutation.target)) return true;

        return Array.from(mutation.addedNodes).some(
          requiresTableContrastUpdate,
        );
      });

      if (hasTableChange) {
        scheduleApplyTableContrastColors();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      observer.disconnect();

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent): void => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const buttonElement = target.closest(
        'button, [role="button"], .p-button'
      );

      if (!(buttonElement instanceof HTMLElement)) return;

      window.requestAnimationFrame(() => {
        if (document.activeElement === buttonElement) {
          buttonElement.blur();
        }
      });
    };

    document.addEventListener("pointerup", handlePointerUp, true);

    return () => {
      document.removeEventListener("pointerup", handlePointerUp, true);
    };
  }, []);

  return <AppRoutes />;
}

export default App;
