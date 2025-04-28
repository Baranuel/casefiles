
type CardElementProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const CardElement = ({icon, title, description}: CardElementProps) => {
  return (
    <div className="flex max-h-[200px] flex-col p-8 md:p-4 gap-3 rounded-md">
      <div className="flex gap-3 items-center">
        {icon}
        <h3 className="text-2xl md:text-xl font-bold text-[#2c2420]">{title}</h3>
      </div>
      <p className="text-[#2c2420]/80 text-lg">{description}</p>
    </div>
  );
}