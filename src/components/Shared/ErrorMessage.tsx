import { Alert } from 'reactstrap';
import React, { FC, ReactNode } from "react";

interface Props {
    children?: ReactNode
    // any props that come into the component
}
const ErrorMessage: FC<Props> = ({ children, ...props }) => (
  <Alert color="danger" fade={false} data-testid="error"{...props}>
    {children}
  </Alert>
);

export default ErrorMessage;
