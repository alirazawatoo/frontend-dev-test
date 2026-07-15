import { Link, type LinkProps } from 'react-router-dom';
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A router link that looks like a button (navigation, not an action). */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
