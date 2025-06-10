// src/components/bookmarks/FolderSidebar.tsx
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  placeIds: string[];
  created_at: string;
}

interface FolderSidebarProps {
  folders: BookmarkFolder[];
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onSelectFolder,
}: FolderSidebarProps) {
  const commonT = useTranslations("Common");

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
        <h3 className="font-semibold text-gray-900 mb-4">
          {commonT("folders") || "폴더"}
        </h3>
        <div className="space-y-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                selectedFolder === folder.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "hover:bg-gray-50"
              )}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: folder.color }}
              />
              <div className="flex-1">
                <div className="font-medium">{folder.name}</div>
                {folder.description && (
                  <div className="text-xs text-gray-500">
                    {folder.description}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {folder.placeIds.length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
