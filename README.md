# DataTable Lib

This lib provides a customizable data table component for your Next.js application. It supports features like pagination, sorting, filtering, and dynamic column generation.

## Features

- Pagination
- Sorting
- Filtering
- Dynamic column generation
- Customizable column headers and cell rendering
- Loading state
- Menu actions

## Installation

To use this lib, import the necessary components and set up your table as shown in the examples below.

## Usage

### Basic Example

```tsx
import React from 'react';
import { FieldConfig } from '@/plugins/data-table/auto-generate-columns';
import { Table } from '@/plugins/data-table/table';
import api from '@/lib/api';

interface DataTableProps {
  translations: {
    active: string;
    name: string;
    description: string;
    tasks: string;
    filterChecklists: string;
  };
}

export default async function DataTable({ translations }: DataTableProps) {
  const response = await api.get('/data-endpoint');
  const data = response.data.results;

  const fieldMapping: Record<string, FieldConfig> = {
    id: { linkKey: '/[id]/', header: 'ID' },
    isActive: { header: translations.active },
    name: { header: translations.name, headerClassName: 'w-1/3' },
    description: { header: translations.description, headerClassName: 'w-1/3' },
    tasks: { header: translations.tasks },
  };

  return (
    <Table
      data={data}
      visibleProperties={['id', 'name', 'description', 'tasks', 'isActive']}
      fieldMapping={fieldMapping}
      filterableColumns={['id', 'name']}
      filterPlaceholder={translations.filterChecklists}
    />
  );
}
```

### Loading State Example

```tsx
import React from 'react';
import { FieldConfig } from '@/plugins/data-table/auto-generate-columns';
import { Table } from '@/plugins/data-table/table';

interface LoadingProps {
  translations: {
    active: string;
    name: string;
    description: string;
    tasks: string;
    filterChecklists: string;
  };
}

export default function Loading({ translations }: LoadingProps) {
  const fieldMapping: Record<string, FieldConfig> = {
    id: { linkKey: '/[id]/', header: 'ID' },
    isActive: { header: translations.active },
    name: { header: translations.name, headerClassName: 'w-1/3' },
    description: { header: translations.description, headerClassName: 'w-1/3' },
    tasks: { header: translations.tasks },
  };

  const visibleProperties = ['id', 'name', 'description', 'tasks', 'isActive'];

  return (
    <Table
      visibleProperties={visibleProperties}
      fieldMapping={fieldMapping}
      filterableColumns={['id', 'name']}
      filterPlaceholder={translations.filterChecklists}
      loading
    />
  );
}
```

### Example with Menu Actions

```tsx
import React from 'react';
import { PencilIcon, Trash } from 'lucide-react';
import { Table } from '@/plugins/data-table/table';

const data = members.map((member) => ({
  id: member.id,
  roles: member.roles,
  email: member.email,
  name: {
    fullName: `${member.firstName} ${member.lastName}`,
    isOwner: member.isOwner,
  },
  actions: {
    menuItems: [
      {
        name: 'Edit',
        link: `/edit/${member.id}`,
        active: true,
        icon: <PencilIcon />,
      },
      {
        name: 'Remove',
        link: `/remove/${member.id}`,
        active: member.isOwner,
        icon: <Trash />,
      },
    ],
  },
}));

export default function MembersTable() {
  return (
    <div className="container mx-auto py-10">
      <Table
        data={data}
        visibleProperties={['id', 'name', 'roles', 'email', 'actions']}
        fieldMapping={{
          id: { header: 'ID', type: 'uuid', visibleCharacters: 8 },
          name: { header: 'Name', type: 'name' },
          roles: { header: 'Roles', type: 'role', charLimit: 15 },
          email: { header: 'Email' },
          actions: { header: 'Actions', type: 'menu' },
        }}
        filterableColumns={['name', 'roles', 'email']}
        filterPlaceholder="Search members"
      />
    </div>
  );
}
```

### API

#### Table Props

- `data`: The data to be displayed in the table.
- `visibleProperties`: An array of property names to be displayed as columns.
- `fieldMapping`: An object mapping property names to field configurations.
- `filterableColumns`: An array of property names that can be filtered.
- `filterPlaceholder`: The placeholder text for the filter input.
- `loading`: A boolean indicating whether the table is in a loading state.

#### FieldConfig

- `linkKey`: A template string for generating links.
- `header`: The header text for the column.
- `type`: The type of the field (e.g., 'menu').
- `charLimit`: The character limit for the field.
- `visibleCharacters`: The number of visible characters for the field.
- `headerClassName`: The class name for the header cell.
- `className`: The class name for the cell.
