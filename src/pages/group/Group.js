import React, { useEffect, useState } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { selectGroups, selectPage, selectSize, selectTotalSize, selectSelectedRows } from "../../redux/selectors/GroupSelector";
import {getListGroupAction, updateSelectedRowsAction} from "../../redux/actions/GroupActions";
import GroupApi from "../../api/GroupApi";
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import CustomSearch from "./CustomSearch";
import { Filter, RefreshCcw, PlusCircle, Edit2, Trash2 } from "react-feather";
import CustomFilter from "./CustomFilter";
import filterFactory, { customFilter } from 'react-bootstrap-table2-filter';
import { ReactstrapInput } from "reactstrap-formik";
import { FastField, Form, Formik } from "formik";
import * as Yup from "yup";
import { toastr } from "react-redux-toastr";


const Group = (props) => {

  const getListGroup =  props.getListGroupAction;
  const size = props.size;
  let onTotalMemberFilter;

  useEffect( () => {
    const getAllGroups = async () =>{
      const result = await GroupApi.getAll(1, size);
      const listGroup = result.content;
      const totalSize = result.totalElements;
      getListGroup(listGroup, 1, totalSize);
    }
    getAllGroups();
  },[getListGroup, size]);

  const actionFormatter = (cell, row, rowIndex) => {
    return (
      <Edit2 className="align-midle mr-2"  size={18} onClick={() => updateGroup(row.id)}/>
    );
  };

  const tableColumns = [
    {
      dataField: "name",
      text: "Name",
      sort: true
    },
    {
      dataField: "totalMember",
      text: "Total Member",
      sort: true,
      filter: customFilter(),
      filterRenderer: (onFilter, column) => {
        onTotalMemberFilter = onFilter;
        return null;
      },
    },
    {
      dataField: "action",
      text: "",
      formatter: actionFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '80px' };
      },
      align: () =>{
        return 'center';
      }
    }
  ];

  const handleTableChange = async (type, { page, sortField, sortOrder, searchText, filters }) => {

    //sort
    if(sortField === null || sortField === undefined || sortOrder === null || sortOrder === undefined){
      sortField = 'id'
      sortOrder = 'desc';
    }

    //filter
    const filter = filters && filters.totalMember && filters.totalMember.filterVal ? filters.totalMember.filterVal: null;
    const minTotalMember = filter && filter.minTotalMember ? filter.minTotalMember : null;
    const maxTotalMember = filter && filter.maxTotalMember ? filter.maxTotalMember : null;

   
    const result = await GroupApi.getAll(page, size, sortField, sortOrder, searchText, minTotalMember, maxTotalMember);
    const listGroup = result.content;
    const totalSize = result.totalElements;
    getListGroup(listGroup, page, totalSize, minTotalMember, maxTotalMember, searchText);
  }

  //filter
  const [isVisialeFilter, setVisialeFilter] = useState(false);

  const handleChangeFilter = (minTotalMember , maxTotalMember) =>{
    onTotalMemberFilter({
      minTotalMember,
      maxTotalMember
    });
  }

  // refresh form
  const refreshForm = () =>{
    //refresh form
    props.updateSelectedRowsAction([]);
    handleTableChange(null,
      { page: 1,
        sortField: null,
        sortOrder: null,
        searchText: null,
        filters: null
      })
  }

  //create
  const [isopenModalCreate, setOpenModalCreate] = useState(false);

  const showNotification = (tilte, message) =>{
    const options = {
      timeOut: 3000,
      type: "success",
      showCloseButton: false,
      progressBar: false,
      position: "top-right"
    };

    // show notification
    toastr.success(tilte, message, options);
  }

  const showNotificationErr = (tilte, message) =>{
    const options = {
      timeOut: 3000,
      type: "success",
      showCloseButton: false,
      progressBar: false,
      position: "top-right"
    };

    // show notification
    toastr.error(tilte, message, options);
  }

  //update group
  const [groupUpdateInfo,setGroupUpdateInfo] = useState({});

  const updateGroup = async (GroupId) =>{
    setOpenModalUpdate(true);
    const groupInfo =  await GroupApi.getById(GroupId);
    setGroupUpdateInfo(groupInfo);
    
  }

  const [isopenModalUpdate, setOpenModalUpdate] = useState(false);

  // delete
  const [isopenModalDelete, setOpenModalDelete] = useState(false);
  const handleOnSelect = (row, isSelect) => {

    let selected = props.selectedRows;

    if (isSelect) {
        selected = [...props.selectedRows, row.id]
    } else {
        selected = props.selectedRows.filter(x => x !== row.id)
    }

    props.updateSelectedRowsAction(selected);
  }

  const handleOnSelectAll = (isSelect, rows) => {

    let selected = props.selectedRows;

    const ids = rows.map(r => r.id);

    if (isSelect) {
        selected = ids
    } else {
        selected = []
    }
    props.updateSelectedRowsAction(selected);
  }

  const deleteGroup = async () =>{
    
      try {
        // call api
        await GroupApi.deleteByIds(props.selectedRows);
        //message
        showNotification(
          "Delete Group",
          "Delete group successfully!!"
        );
        //refresh form
        refreshForm();
      } catch (error) {
        // redirect to error page
        props.history.push("/auth/500")
      }
  }
  return(
  <Container fluid className="p-0">
    <h1 className="h3 mb-3">Group Management</h1>

    <Row>
      <Col>
        <Card>
          <CardBody>
          <ToolkitProvider
            keyField="id"
            data={props.groups}
            columns={tableColumns}
            search
          >
      {
        toolkitprops => (
          <>
          {/* Filter */}
            {isVisialeFilter && 
              <Row>
                <Col lg="12">
                  <CustomFilter
                    handleChangeFilter={handleChangeFilter}
                  />
                </Col>
              </Row>
            }
            {/* Search */}
            <Row style={{alignItems: "center"}}>
              <Col lg="3">
                <CustomSearch { ...toolkitprops.searchProps } />
              </Col>
              <Col lg="9">
                <div className="float-right pull-right">
                  <Filter className="align-midle mr-2" size={24} onClick = {() => setVisialeFilter(!isVisialeFilter)}/>
                  <RefreshCcw className="align-midle mr-2"  size={24} onClick = {refreshForm}/>
                  <PlusCircle className="align-midle mr-2"  size={24} onClick = {() => setOpenModalCreate(true)}/>
                  <Trash2 
                    className="align-midle mr-2"  
                    size={24} 
                    onClick = { () => {
                      if(props.selectedRows.length !==0){ 
                        setOpenModalDelete(true)
                      }else{
                        showNotificationErr(
                          "Delete Group",
                          "Please chose group before delete!!"
                        );
                      }
                      }}/>
                </div>
              </Col>
            </Row>
            <BootstrapTable
              remote
              { ...toolkitprops.baseProps }
              bootstrap4
              striped
              hover
              bordered={true}
              pagination={paginationFactory({
                page: props.page,
                sizePerPage: props.size,
                totalSize: props.totalSize,
                hideSizePerPage: true
              })}
              onTableChange={ handleTableChange }
              filter={ filterFactory() }
              selectRow={{
                mode: 'checkbox',
                clickToSelect: true,
                selected: props.selectedRows,
                onSelect: handleOnSelect,
                onSelectAll: handleOnSelectAll
              }}
            />
          </>
        )
      }
        </ToolkitProvider>
          </CardBody>
        </Card>
      </Col>
    </Row>
    <Modal isOpen={isopenModalCreate}>
    <Formik
        initialValues={{
          name: ''
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .min(6, "Must be betweem 6 and 50 characters")
            .max(50, "Must be betweem 6 and 50 characters")
            .required("Required")
            .test(
              "checkUniqueName",
              "This name is already registered.",
              async (name) => {
                // call api
                const isExists = await GroupApi.existsByName(name);
                return !isExists;
              }
            ),

        })}
        onSubmit={async (values) => {
          try {
            // call api
            await GroupApi.create(values.name);
            //message
            showNotification(
              "Create Group",
              "Create group successfully!!"
            );
            //refresh form
            refreshForm();
          } catch (error) {
            // redirect to error page
            props.history.push("/auth/500")
          }finally{
            //close modal
            setOpenModalCreate(false);
          }
          
          }
        }
        validateOnChange={false}
        validateOnBlur={false}
      >
      {({ isSubmitting }) => ( 
        <Form>
          <ModalHeader>Create Group</ModalHeader>
          <ModalBody className="m-3">
          
            <Row style={{alignItems: "center"}}>
                  <Col lg="auto">
                      <label>Group name:</label>
                  </Col>
                  <Col>
                      <FastField
                          type="text"
                          bsSize="lg"
                          name="name"
                          placeholder="Enter group name...."
                          component={ReactstrapInput}
                      />
                  </Col>
              </Row>
            
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={isSubmitting}
              type="submit"
            >
              Save
            </Button>{" "}
            <Button  color="primary" onClick={() => setOpenModalCreate(false)}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      )}
      </Formik>
      </Modal>

      <Modal isOpen={isopenModalUpdate}>
    <Formik
        enableReinitialize
        initialValues={{
          name: groupUpdateInfo && groupUpdateInfo.name ? groupUpdateInfo.name : '',
          totalMember: groupUpdateInfo && groupUpdateInfo.totalMember !== undefined && groupUpdateInfo.totalMember !== null ? groupUpdateInfo.totalMember : ''
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .min(6, "Must be betweem 6 and 50 characters")
            .max(50, "Must be betweem 6 and 50 characters")
            .required("Required")
            .test(
              "checkUniqueName",
              "This name is already registered.",
              async (name) => {
                if(name === groupUpdateInfo.name){
                  return true;
                }
                // call api
                const isExists = await GroupApi.existsByName(name);
                return !isExists;
              }
            ),
            totalMember: Yup.number()
            .min(0,'Must be greater than or equal 0 and integer')
            .integer('ust be greater than or equal 0 and integer'),
        })}
        onSubmit={async (values) => {
          try {
            // call api
            await GroupApi.update(
                groupUpdateInfo.id,
                values.name,
                values.totalMember
              );
            //message
            showNotification(
              "Update Group",
              "Update group successfully!!"
            );
            //refresh form
            refreshForm();
          } catch (error) {
            // redirect to error page
            props.history.push("/auth/500")
          }finally{
            //close modal
            setOpenModalUpdate(false);
          }
          
          }
        }
        validateOnChange={false}
        validateOnBlur={false}
      >
      {({ isSubmitting }) => ( 
        <Form>
          <ModalHeader>Update Group</ModalHeader>
          <ModalBody className="m-3">
          
            <Row style={{alignItems: "center"}}>
                  <Col lg="auto">
                      <label>Group name:</label>
                  </Col>
                  <Col>
                      <FastField
                          type="text"
                          bsSize="lg"
                          name="name"
                          placeholder="Enter group name...."
                          component={ReactstrapInput}
                      />
                  </Col>
              </Row>

              <Row style={{alignItems: "center"}}>
                  <Col lg="auto">
                      <label>Total Member:</label>
                  </Col>
                  <Col>
                      <FastField
                          type="number"
                          bsSize="lg"
                          name="totalMember"
                          placeholder="Enter group name...."
                          component={ReactstrapInput}
                      />
                  </Col>
              </Row>
            
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={isSubmitting}
              type="submit"
            >
              Save
            </Button>{" "}
            <Button  color="primary" onClick={() => setOpenModalUpdate(false)}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      )}
      </Formik>
      </Modal>
      <Modal isOpen={isopenModalDelete}>
    <Formik
        enableReinitialize
        initialValues={{
          
        }}
        
        onSubmit={() =>{
          deleteGroup()
          setOpenModalDelete(false)
        }
        }
        
      >
      {({ isSubmitting }) => ( 
        <Form>
          <ModalHeader>Delete Group</ModalHeader>
          <ModalBody className="m-3">
          <p className="mb-0">
            Confirm delete groups.
          </p>
          <p className="mb-0">Are you sure confirm delete group.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              disabled={isSubmitting}
              type="submit" 
            >
              Delete
            </Button>{" "}
            <Button color="primary" onClick={() => setOpenModalDelete(false)}>
              Close
            </Button>
          </ModalFooter>
        </Form>
      )}
      </Formik>
      </Modal>
  </Container>
)};

const mapGlobalStateToProps = state =>{
  return{
    groups: selectGroups(state),
    page: selectPage(state),
    size: selectSize(state),
    totalSize: selectTotalSize(state),
    selectedRows: selectSelectedRows(state)
  }
}
export default connect(mapGlobalStateToProps, {getListGroupAction, updateSelectedRowsAction})(Group);

