// src/components/bookmarks/CreateFolderModal.tsx
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const commonT = useTranslations("Common");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3B82F6");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    onCreateFolder(newFolderName, newFolderColor);
    setNewFolderName("");
    setNewFolderColor("#3B82F6");
    onClose();
  };

  const handleClose = () => {
    setNewFolderName("");
    setNewFolderColor("#3B82F6");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={commonT("createFolder") || "새 폴더 만들기"}
      size="sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {commonT("folderName") || "폴더 이름"}
          </label>
          <input
            type="text"
            placeholder={
              commonT("folderNamePlaceholder") || "예: 서울 여행, 부산 맛집..."
            }
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {commonT("folderColor") || "폴더 색상"}
          </label>
          <div className="flex gap-2">
            {[
              "#3B82F6",
              "#10B981",
              "#F59E0B",
              "#EF4444",
              "#8B5CF6",
              "#06B6D4",
              "#84CC16",
              "#F97316",
            ].map((color) => (
              <button
                key={color}
                onClick={() => setNewFolderColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  newFolderColor === color
                    ? "border-gray-400 scale-110"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            {commonT("cancel") || "취소"}
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
            className="flex-1"
          >
            {commonT("create") || "만들기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
