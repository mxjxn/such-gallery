import React, { useRef, useState } from "react";
import { CheckCircleIcon, ClipboardIcon } from "@heroicons/react/24/solid";

const CopyTextComponent = ({
  className = "",
  text,
}: {
  className?: string;
  text: string;
}) => {
	const [clicked, setClicked] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const triggerCopy = async (
    event: React.MouseEvent<HTMLDivElement | MouseEvent>
  ) => {
    if (elementRef?.current) {
      try {
        await navigator.clipboard.writeText(
          elementRef.current.textContent || ""
        );
				!clicked && setClicked(true);
      } catch (err) {
        console.error("Failed to copy text", err);
      }
    }
  };

  return (
    <div
      className={`
				flex
				group
				items-center
				justify-stretch
				hover:bg-slate-700
				hover:cursor-pointer
				active:bg-slate-600
				${className}
			`}
      ref={elementRef}
      onClick={triggerCopy}
    >
      <div
				className={`
					flex-grow
				`}
			>
				{text}
			</div>
      <div className="ml-1">
				{ 
					!clicked ? (
						<ClipboardIcon
							className={`group-hover:text-secondary text-xs h-5 w-5 `}
						/>
					) : (
						<CheckCircleIcon
							className={`text-success text-xs h-5 w-5 `}
						/>
					)}
      </div>
    </div>
  );
};

export default CopyTextComponent;
