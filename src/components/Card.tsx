import { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
};

export function Card({ title, description, disabled, children }: CardProps) {
  return (
    <div className={`card ${disabled ? "card--disabled" : ""}`}>
      <div className="card__header">
        <h3 className="card__title">{title}</h3>
        {description ? <p className="card__description">{description}</p> : null}
      </div>
      {children ? <div className="card__body">{children}</div> : null}
    </div>
  );
}
