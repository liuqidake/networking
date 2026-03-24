import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  tokens,
} from "@fluentui/react-components";

interface UnlinkDialogProps {
  open: boolean;
  apimInstance: string;
  apiName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnlinkDialog({
  open,
  apimInstance,
  apiName,
  onClose,
  onConfirm,
}: UnlinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Unlink API from API Management?</DialogTitle>
          <DialogContent>
            This will remove the API <strong>{apiName}</strong> from the{" "}
            <strong>{apimInstance}</strong> instance. The API definition in APIM
            will not be deleted, but this App Service will no longer be connected.
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onConfirm}
              style={{ backgroundColor: tokens.colorPaletteRedBackground3, borderColor: tokens.colorPaletteRedBackground3 }}
            >
              Unlink
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
