/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown, DropdownFilterEvent } from "primereact/dropdown";
import Loader from "./Loader";
import useDebouncedEffect from "../hooks/useDebounce";
import {
  IGetLoanApplicationPermissionUsersResponse,
  ILoanApplicationPermissionUser,
} from "../interface/loanApplicationManagement";
import {
  assignLoanApplicationsToUMUserAPI,
  getUsersWithLoanApplicationPermissionAPI,
} from "../utils/axios/apiServices";
import {
  debounceTimeInMilliseconds,
  formatMobileNumber,
} from "../utils/constants/constant";
import { toastError, toastSuccess } from "../utils/functions/shared";
import { decryptVAPTData } from "../utils/functions/encryptDecrypt";

interface AssignLoanModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  selectedLoanApplicationIds: string[];
  onAssignSuccess: () => Promise<void>;
}

const AssignLoanModal = ({
  visible,
  setVisible,
  selectedLoanApplicationIds,
  onAssignSuccess,
}: AssignLoanModalProps) => {
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

  const [dropdownUsers, setDropdownUsers] = useState<
    ILoanApplicationPermissionUser[]
  >([]);

  const [selectedUser, setSelectedUser] =
    useState<ILoanApplicationPermissionUser | null>(null);

  const [dropdownSearch, setDropdownSearch] = useState<string>("");

  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);

  const [formError, setFormError] = useState<string>("");

  const dropdownRef = useRef<any>(null);

  const dropdownPanelRef = useRef<HTMLDivElement | null>(null);

  const lastFetchedPageRef = useRef<number>(0);

  const fetchingRef = useRef<boolean>(false);

  const noMoreDataRef = useRef<boolean>(false);

  const currentSearchRef = useRef<string>("");

  const resetAssignLoanForm = (): void => {
    setSelectedUser(null);
    setDropdownUsers([]);
    setDropdownSearch("");
    setDropdownLoading(false);
    setAssignLoading(false);
    setFormError("");
    lastFetchedPageRef.current = 0;
    fetchingRef.current = false;
    noMoreDataRef.current = false;
    currentSearchRef.current = "";
  };

  const handleClose = (): void => {
    setVisible(false);
    resetAssignLoanForm();
  };

  const fetchDropdownUsers = async (
    page: number,
    search: string
  ): Promise<void> => {
    if (fetchingRef.current || noMoreDataRef.current) {
      return;
    }

    fetchingRef.current = true;
    setDropdownLoading(true);

    try {
      const response: IGetLoanApplicationPermissionUsersResponse =
        await getUsersWithLoanApplicationPermissionAPI({
          page,
          pageSize: 10,
          search: search.trim(),
        });

      if (!response) {
        return;
      }

      if (response.statusCode === 200) {
        const users = response.data.users || [];

        if (users.length === 0) {
          noMoreDataRef.current = true;
          return;
        }

        const formattedUsers = users.map((user) => ({
          ...user,
          email: user.email ? decryptVAPTData(user.email) : "",
          phoneNumber: user.phoneNumber
            ? decryptVAPTData(user.phoneNumber)
            : "",
        }));

        setDropdownUsers((prev) =>
          page === 1 ? formattedUsers : [...prev, ...formattedUsers]
        );
        lastFetchedPageRef.current = page;

        if (users.length < 10) {
          noMoreDataRef.current = true;
        }
      } else {
        toastError(response.message);
      }
    } finally {
      fetchingRef.current = false;
      setDropdownLoading(false);
    }
  };

  const handleDropdownSearch = (event: DropdownFilterEvent): void => {
    setDropdownSearch(event.filter || "");
  };

  const handleDropdownScroll = (e: Event): void => {
    if (fetchingRef.current || noMoreDataRef.current) {
      return;
    }

    const target = e.target as HTMLDivElement;
    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10;

    if (isAtBottom) {
      fetchDropdownUsers(
        lastFetchedPageRef.current + 1,
        currentSearchRef.current
      );
    }
  };

  const handleDropdownShow = (): void => {
    setTimeout(() => {
      const panel = document.querySelector(
        ".assign-loan-dropdown-panel .p-dropdown-items-wrapper"
      ) as HTMLDivElement | null;

      if (panel) {
        dropdownPanelRef.current = panel;
        panel.addEventListener("scroll", handleDropdownScroll);
      }
    }, 0);
  };

  const handleDropdownHide = (): void => {
    if (dropdownPanelRef.current) {
      dropdownPanelRef.current.removeEventListener(
        "scroll",
        handleDropdownScroll
      );
      dropdownPanelRef.current = null;
    }
  };

  const handleAssignLoan = async (): Promise<void> => {
    if (!selectedLoanApplicationIds.length) {
      toastError("Please select at least one loan application.");
      return;
    }

    if (!selectedUser) {
      setFormError("Please select a user.");
      return;
    }

    setAssignLoading(true);

    const response = await assignLoanApplicationsToUMUserAPI({
      umUserId: selectedUser.userID,
      loanApplicationIds: selectedLoanApplicationIds,
    });

    if (!response) {
      setAssignLoading(false);
      return;
    }

    if (response.statusCode === 200) {
      toastSuccess(response.message);
      await onAssignSuccess();
      handleClose();
    } else {
      toastError(response.message);
    }

    setAssignLoading(false);
  };

  useDebouncedEffect(
    () => {
      if (!visible) {
        return;
      }

      setDropdownUsers([]);
      lastFetchedPageRef.current = 0;
      noMoreDataRef.current = false;
      fetchingRef.current = false;
      currentSearchRef.current = dropdownSearch.trim();

      fetchDropdownUsers(1, dropdownSearch.trim());
    },
    debounceTimeInMilliseconds,
    [dropdownSearch, visible]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDropdownUsers([]);
    lastFetchedPageRef.current = 0;
    noMoreDataRef.current = false;
    fetchingRef.current = false;
    currentSearchRef.current = "";

    fetchDropdownUsers(1, "");
  }, [visible]);

  useEffect(() => {
    return () => {
      if (dropdownPanelRef.current) {
        dropdownPanelRef.current.removeEventListener(
          "scroll",
          handleDropdownScroll
        );
      }
    };
  }, []);

  return (
    <Dialog
      header="Assign Loan"
      visible={visible}
      onHide={handleClose}
      modal
      blockScroll
      draggable={false}
      resizable={false}
      className="modalWrapper responsive-dialog"
      style={{ width: "900px" }}
    >
      <Loader isLoading={assignLoading} />

      <div className="d-flex flex-column gap-4">
        <div className="form-group w-100 txt-black fw-semibold mt-2">
          <label className="form-label font-15" htmlFor="loanAssignedUser">
            Select User
          </label>

          <Dropdown
            ref={dropdownRef}
            value={selectedUser}
            options={dropdownUsers}
            optionLabel="fullName"
            placeholder="Select User"
            filter
            className="w-100"
            onFilter={handleDropdownSearch}
            onChange={(event) => {
              setSelectedUser(event.value);
              setFormError("");
            }}
            loading={dropdownLoading}
            panelClassName="assign-loan-dropdown-panel w-25"
            onShow={handleDropdownShow}
            onHide={handleDropdownHide}
          />

          {formError && <small className="error">{formError}</small>}
        </div>

        {selectedUser && (
          <div className="user-info-card">
            <div className="user-info-header">
              <span>User Details</span>
            </div>

            <div className="user-info-grid">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{selectedUser.fullName}</span>
              </div>

              {selectedUser.email && (
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{selectedUser.email}</span>
                </div>
              )}

              {selectedUser.phoneNumber && (
                <div className="info-row">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value">
                    {formatMobileNumber(selectedUser.phoneNumber)}
                  </span>
                </div>
              )}

              <div className="info-row">
                <span className="info-label">Designation</span>
                <span className="info-value">
                  {selectedUser.designation || "-"}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Role</span>
                <span className="info-value">{selectedUser.roleName || "-"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="user-info-card">
          <div className="user-info-header">
            <span>Loan Selection Summary</span>
          </div>

          <div className="user-info-grid">
            <div className="info-row">
              <span className="info-label">Total Loans Selected:</span>
              <span className="info-value">
                {selectedLoanApplicationIds.length}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Button
            label="Cancel"
            className="btn btn-orange-line"
            onClick={handleClose}
          />

          <Button
            label="Assign Loan"
            className="btn btn-orange"
            loading={assignLoading}
            disabled={!selectedUser}
            onClick={handleAssignLoan}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default AssignLoanModal;
