interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ children, className = "" }: TableProps) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
}

export const TableHead = ({ children }: TableHeadProps) => {
  return <thead>{children}</thead>;
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody = ({ children }: TableBodyProps) => {
  return <tbody>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
}

export const TableRow = ({ children }: TableRowProps) => {
  return <tr>{children}</tr>;
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader = ({ children, className = "" }: TableHeaderProps) => {
  return <th className={`border p-2 bg-gray-100 ${className}`}>{children}</th>;
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const TableCell = ({ children, className = "" }: TableCellProps) => {
  return <td className={`border p-2 ${className}`}>{children}</td>;
};