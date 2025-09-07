import React from 'react'
import { List, Datagrid, TextField, DateField, EditButton, DeleteButton, Edit, SimpleForm, TextInput, SelectInput, Create } from 'react-admin'

export const UsersList = () => (
  <List>
    <Datagrid bulkActionButtons={false}>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="department" />
      <DateField source="last_login" />
      <TextField source="role" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const UsersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <SelectInput source="department" choices={[{id:'IT',name:'IT'},{id:'HR',name:'HR'},{id:'Accounts',name:'Accounts'},{id:'Factory',name:'Factory'},{id:'Marketing',name:'Marketing'}]} />
      <SelectInput source="role" choices={[{id:'Admin',name:'Admin'},{id:'User',name:'User'}]} />
    </SimpleForm>
  </Edit>
)

export const UsersCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <SelectInput source="department" choices={[{id:'IT',name:'IT'},{id:'HR',name:'HR'},{id:'Accounts',name:'Accounts'},{id:'Factory',name:'Factory'},{id:'Marketing',name:'Marketing'}]} />
      <SelectInput source="role" choices={[{id:'Admin',name:'Admin'},{id:'User',name:'User'}]} />
    </SimpleForm>
  </Create>
)
