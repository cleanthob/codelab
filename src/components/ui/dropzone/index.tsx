import {
  FileList,
  FileListAction,
  FileListActions,
  FileListDescription,
  FileListHeader,
  FileListIcon,
  FileListInfo,
  FileListItem,
  FileListName,
  FileListSize,
} from "@/components/ui/file-list";
import { Trash2 } from "lucide-react";
import { Accept } from "react-dropzone";
import {
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  Dropzone as DropzoneRoot,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone,
} from "./components";

type DropzoneProps = {
  file?: File;
  setFile: (file: File | null) => void;
  accept?: Accept;
};

const defaultAccept: Accept = {
  "image/*": [".jpg", ".png", ".jpeg", ".webp"],
};

export const Dropzone = ({
  file,
  setFile,
  accept = defaultAccept,
}: DropzoneProps) => {
  return (
    <DropzoneRoot
      accept={accept}
      maxSize={5 * 1024 * 1024} // 5MB
      onDropAccepted={(files) => setFile(files[0])}
    >
      <div className="flex flex-col gap-4">
        <DropzoneZone>
          <DropzoneInput />
          <DropzoneGroup className="gap-4">
            <DropzoneUploadIcon />
            <DropzoneGroup>
              <DropzoneTitle>
                Arraste e solte ou clique para fazer upload
              </DropzoneTitle>
              <DropzoneDescription>Máximo de 5MB</DropzoneDescription>
            </DropzoneGroup>
          </DropzoneGroup>
        </DropzoneZone>
        {file && (
          <FileList>
            <FileListItem>
              <FileListHeader>
                <FileListIcon />
                <FileListInfo>
                  <FileListName>{file.name}</FileListName>
                  <FileListDescription>
                    <FileListSize>{file.size}</FileListSize>
                  </FileListDescription>
                </FileListInfo>
                <FileListActions>
                  <FileListAction onClick={() => setFile(null)}>
                    <Trash2 />
                  </FileListAction>
                </FileListActions>
              </FileListHeader>
            </FileListItem>
          </FileList>
        )}
      </div>
    </DropzoneRoot>
  );
};
