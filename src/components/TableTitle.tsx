interface ITableTitle {
  title: string;
}

const TableTitle = ({ title }: ITableTitle) => {
  return <h2 className="txt-24 fw-bold">{title}</h2>;
};

export default TableTitle;
