import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

export function RootToaster({
  max = 1,
  ...props
}: React.ComponentProps<typeof Toaster> & {
  max?: number;
}) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= max)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts, max]);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        // warn
        duration: 1000,

        className:
          "!pl-5 min-w-[358px] !rounded-2xl  !h-[56px] !bg-[#6D6D6D] !text-white !font-medium !text-md !text-center",

        // success
        success: {
          className:
            "!pl-5 min-w-[358px] !rounded-2xl !h-[56px] !bg-[#6D6D6D] !text-white !font-medium !text-md !text-center",
        },
        // error
        error: {
          className:
            "!pl-5 min-w-[358px] !rounded-2xl !h-[56px] !bg-[#6D6D6D] !text-white !font-medium !text-md !text-center keep-all",
        },
      }}
      {...props}
    />
  );
}
