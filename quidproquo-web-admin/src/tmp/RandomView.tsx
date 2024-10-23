import { ComponentType, memo } from 'react';
import { useAuthAccessToken } from 'quidproquo-web-react';

import { AsyncButton, DataGrid, DataGridColumDefinitions,DateRangePicker, GridContainer, GridItem, TabViewBox, TextInput } from '../components';

const columns: DataGridColumDefinitions<any>[] = [
  {
    field: 'firstName',
    headerName: 'first name',
    sortable: true,
    widthScale: 1,
  },
  {
    field: 'LastName',
    headerName: 'Last Name',
    sortable: true,
    widthScale: 1,
  },
  {
    field: 'email',
    headerName: 'Email',
    sortable: true,
    widthScale: 3,
  },
  {
    field: 'status',
    headerName: 'Status',
    sortable: true,
    widthScale: 1,
  },
  {
    field: 'updatedAt',
    headerName: 'Last Updated',
    sortable: true,
    widthScale: 1,
  },
];

const AdminView: ComponentType = () => {
  const accessToken = useAuthAccessToken();

  return (
    <TabViewBox
      header={() => (
        <GridContainer spacing={2} xs={12}>
          <GridItem xs={6}>
            <DateRangePicker
              startIsoDateTime={new Date().toISOString()}
              endIsoDateTime={new Date().toISOString()}
              setStartIsoDateTime={() => {}}
              setEndIsoDateTime={() => {}}
            />
          </GridItem>
          <GridItem xs={4}>
            <TextInput label="Email" onChange={() => {}} value="" />
          </GridItem>
          <GridItem xs={2}>
            <AsyncButton onClick={async () => {}}>Search</AsyncButton>
          </GridItem>
        </GridContainer>
      )}
      body={() => <DataGrid items={[]} columns={columns} />}
    />
  );
};

export default memo(AdminView);
