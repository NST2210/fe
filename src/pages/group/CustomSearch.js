import React from "react";
import {
    Button,
    Row,
    Col,
    InputGroupAddon
  } from "reactstrap";
import { FastField, Form, Formik } from "formik";
import { ReactstrapInput } from "reactstrap-formik";
import { connect } from 'react-redux';
import { selectSearch } from '../../redux/selectors/GroupSelector';

const CustomSearch = (props) => {

    

    return (
        <Formik
        key={Date.parse(new Date())}
        enableReinitialize
        initialValues={{
          search: props.search ? props.search : '',
        }}
        
        onSubmit={
            values => {
                props.onSearch(values.search);
          }
        }
      >
        <Form>
            <Row style={{alignItems: "center"}}>
                <Col>
                    <FastField
                        type="text"
                        bsSize="lg"
                        name="search"
                        placeholder="Search for..."
                        component={ReactstrapInput}
                    />
                </Col>
                <Col xs="auto">
                    <InputGroupAddon addonType="append" color="primary">
                        <Button type="submit">Go!</Button>
                    </InputGroupAddon>
                </Col>
            </Row>
        </Form>
    </Formik>
    );
}

const mapGlobalStateToProps = state =>{
    return{
        search: selectSearch(state),
    }
  }
export default connect(mapGlobalStateToProps)(CustomSearch);