import { ReactNode } from "react";

const LabeledField = ({
  label,
  children,
  className = "",
  inline = false,
}: {
  label: string;
  children: ReactNode;
  inline?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`
				w-full
				flex 
				${!inline ? "flex-col" : "flex-row items-center justify-stretch"}
				text-xs 
				p-0.5 
				bg-zinc-900 
				${className}
	    `}
    >
      <div className={`mt-1 mb-px pl-3 min-w-[6em]`}>{label}:</div>
      <div className="p-2 bg-zinc-800 inline-block flex-grow">
        <div className="py-2 bg-zinc-800 block">{children}</div>
      </div>
    </div>
  );
};

export default LabeledField;
