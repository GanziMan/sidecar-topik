import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ModalDialogProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function ModalDialog({ children, trigger, description }: ModalDialogProps) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="bg-white h-[calc(100vh-100px)] max-w-[1200px] overflow-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" className="w-full max-w-[200px] mx-auto mt-3">
                닫기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
