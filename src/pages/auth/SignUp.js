import React, {useState} from "react";
import { withRouter } from "react-router-dom";

import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { ReactstrapInput } from "reactstrap-formik";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import UserApi from "../../api/UserApi";

const SignUp = (props) => {
  const [isopenModal, setOpenModal] = useState(false);

  const [email, setEmail] = useState("");

  const [isDisableResendButton, setDisableResendButton] = useState(false);

  const resendEmailToActiveAccount = async () => {
    setDisableResendButton(true);
    await UserApi.resendEmailToActiveAccount(email);
    setDisableResendButton(false);
  };

  const redirectToLogin = () => {
    props.history.push("/auth/sign-in");
  };

  return (
    <React.Fragment>
      <div className="text-center mt-4">
        <h1 className="h2">Get started</h1>
        <p className="lead">
          Start creating the best possible user experience for you customers.
        </p>
      </div>

      <Formik
        initialValues={{
          firstname: "",
          lastname: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object({
          firstname: Yup.string()
            .max(50, "Must be less than 50 characters")
            .required("Required"),

          lastname: Yup.string()
            .max(50, "Must be less than 50 characters")
            .required("Required"),

          username: Yup.string()
            .min(6, "Must be betweem 6 and 50 characters")
            .max(50, "Must be betweem 6 and 50 characters")
            .required("Required")
            .test(
              "checkExistsUsername",
              "This username is already registered.",
              async (username) => {
                // call api
                const isExists = await UserApi.existsByUsername(username);

                return !isExists;
              }
            ),

          email: Yup.string()
            .email("Invalid email address")
            .required("Required")
            .test(
              "checkExistsEmail",
              "This email is already registered.",
              async (email) => {
                // call api
                const isExists = await UserApi.existsByEmail(email);

                return !isExists;
              }
            ),
          password: Yup.string()
            .min(6, "Must be betweem 6 and 50 characters")
            .max(50, "Must be betweem 6 and 50 characters")
            .required("Required"),

          confirmPassword: Yup.string()
            .required("Required")
            .when("password", {
              is: (val) => (val && val.length > 0 ? true : false),
              then: Yup.string().oneOf(
                [Yup.ref("password")],
                "Both password need to be the same"
              ),
            }),
        })}
        onSubmit={async (values) => {
          try {
            // call api
            await UserApi.create(
              values.firstname,
              values.lastname,
              values.username,
              values.email,
              values.password
            );
            //message
            setEmail(values.email);
            setOpenModal(true);
          } catch (error) {
            props.history.push("/auth/500");
            
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ isSubmitting }) => (
          <Card>
            <CardBody>
              <div className="m-sm-4">
                <Form>
                  <FormGroup>
                    <FastField
                      label="First Name"
                      type="text"
                      bsSize="lg"
                      name="firstname"
                      placeholder="Enter your first name"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label="Last Name"
                      type="text"
                      bsSize="lg"
                      name="lastname"
                      placeholder="Enter your last name"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label="Username"
                      type="text"
                      bsSize="lg"
                      name="username"
                      placeholder="Enter your username"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label="Email"
                      type="email"
                      bsSize="lg"
                      name="email"
                      placeholder="Enter your email"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label="Password"
                      type="password"
                      bsSize="lg"
                      name="password"
                      placeholder="Enter your password"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label="Confirm Password"
                      type="password"
                      bsSize="lg"
                      name="confirmPassword"
                      placeholder="Enter your confirm password"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <div className="text-center mt-3">
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      Sign up
                    </Button>
                  </div>
                </Form>
              </div>
            </CardBody>
          </Card>
        )}
      </Formik>
      <Modal isOpen={isopenModal}>
        <ModalHeader>You need to reset password</ModalHeader>
        <ModalBody className="m-3">
          <p className="mb-0">
            We have send an email to <b>{email}</b>
          </p>
          <p className="mb-0">Please check your email to reset password.</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={resendEmailToActiveAccount}
            disabled={isDisableResendButton}
          >
            Resend
          </Button>{" "}
          <Button color="primary" onClick={redirectToLogin}>
            Login
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default withRouter(SignUp);
