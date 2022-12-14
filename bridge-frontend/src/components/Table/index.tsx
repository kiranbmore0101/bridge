/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * License); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * AS IS BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { Table as AntTable, ConfigProvider } from 'antd';
import {
  ColumnType,
  ColumnGroupType,
  TableProps as AntTableProps,
} from 'antd/es/table';
import { PaginationProps } from 'antd/es/pagination';
import { Key } from 'antd/lib/table/interface';
import { t, useTheme, logging } from '@bridge-ui/core';
import Loading from 'src/components/Loading';
import styled, { StyledComponent } from '@emotion/styled';
import InteractiveTableUtils from './utils/InteractiveTableUtils';
import VirtualTable from './VirtualTable';

export const BRIDGE_TABLE_COLUMN = 'bridge/table-column';
export interface TableDataType {
  key: React.Key;
}

export interface TablePaginationConfig extends PaginationProps {
  extra?: object;
}

export type ColumnsType<RecordType = unknown> = (
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>
)[];

export enum SelectionType {
  'DISABLED' = 'disabled',
  'SINGLE' = 'single',
  'MULTI' = 'multi',
}

export interface Locale {
  /**
   * Text contained within the Table UI.
   */
  filterTitle: string;
  filterConfirm: string;
  filterReset: string;
  filterEmptyText: string;
  filterCheckall: string;
  filterSearchPlaceholder: string;
  emptyText: string;
  selectAll: string;
  selectInvert: string;
  selectNone: string;
  selectionAll: string;
  sortTitle: string;
  expand: string;
  collapse: string;
  triggerDesc: string;
  triggerAsc: string;
  cancelSort: string;
}

export type SortOrder = 'descend' | 'ascend' | null;
export interface SorterResult<RecordType> {
  column?: ColumnType<RecordType>;
  order?: SortOrder;
  field?: Key | Key[];
  columnKey?: Key;
}

export enum ETableAction {
  PAGINATE = 'paginate',
  SORT = 'sort',
  FILTER = 'filter',
}

export interface TableCurrentDataSource<RecordType> {
  currentDataSource: RecordType[];
  action: ETableAction;
}

export type OnChangeFunction = (
  pagination: TablePaginationConfig,
  filters: Record<string, (Key | boolean)[] | null>,
  sorter: SorterResult<any> | SorterResult<any>[],
  extra: TableCurrentDataSource<any>,
) => void;

export interface TableProps extends AntTableProps<TableProps> {
  /**
   * Data that will populate the each row and map to the column key.
   */
  data: object[];
  /**
   * Table column definitions.
   */
  columns: ColumnsType<any>;
  /**
   * Array of row keys to represent list of selected rows.
   */
  selectedRows?: React.Key[];
  /**
   * Callback function invoked when a row is selected by user.
   */
  handleRowSelection?: Function;
  /**
   * Controls the size of the table.
   */
  size: TableSize;
  /**
   * Adjusts the padding around elements for different amounts of spacing between elements.
   */
  selectionType?: SelectionType;
  /*
   * Places table in visual loading state.  Use while waiting to retrieve data or perform an async operation that will update the table.
   */
  loading?: boolean;
  /**
   * Uses a sticky header which always displays when vertically scrolling the table.  Default: true
   */
  sticky?: boolean;
  /**
   * Controls if columns are resizable by user.
   */
  resizable?: boolean;
  /**
   * EXPERIMENTAL: Controls if columns are re-orderable by user drag drop.
   */
  reorderable?: boolean;
  /**
   * Controls if pagination is active or disabled.
   */
  usePagination?: boolean;
  /**
   * Default number of rows table will display per page of data.
   */
  defaultPageSize?: number;
  /**
   * Array of numeric options for the number of rows table will display per page of data.
   * The user can select from these options in the page size drop down menu.
   */
  pageSizeOptions?: string[];
  /**
   * Set table to display no data even if data has been provided
   */
  hideData?: boolean;
  /**
   * emptyComponent
   */
  emptyComponent?: ReactElement;
  /**
   * Enables setting the text displayed in various components and tooltips within the Table UI.
   */
  locale?: Locale;
  /**
   * Restricts the visible height of the table and allows for internal scrolling within the table
   * when the number of rows exceeds the visible space.
   */
  height?: number;
  /**
   * Sets the table to use react-window for scroll virtualization in cases where
   * there are unknown amount of columns, or many, many rows
   */
  virtualize?: boolean;
  /**
   * Used to override page controls total record count when using server-side paging.
   */
  recordCount?: number;
  /**
   * Invoked when the tables sorting, paging, or filtering is changed.
   */
  onChange?: OnChangeFunction;
}

interface IPaginationOptions {
  hideOnSinglePage: boolean;
  pageSize: number;
  pageSizeOptions: string[];
  onShowSizeChange: Function;
  total?: number;
}

export enum TableSize {
  SMALL = 'small',
  MIDDLE = 'middle',
}

const defaultRowSelection: React.Key[] = [];

const PAGINATION_HEIGHT = 40;
const HEADER_HEIGHT = 68;

const StyledTable: StyledComponent<any> = styled(AntTable)<any>(
  ({ theme, height }) => `
    .ant-table-body {
      overflow: auto;
      height: ${height ? `${height}px` : undefined};
    }

    th.ant-table-cell {
      font-weight: ${theme.typography.weights.bold};
      color: ${theme.colors.grayscale.dark1};
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ant-table-tbody > tr > td {
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid ${theme.colors.grayscale.light3};
    }

    .ant-pagination-item-active {
      border-color: ${theme.colors.primary.base};
    }
  }
`,
);

const StyledVirtualTable: StyledComponent<any> = styled(VirtualTable)<any>(
  ({ theme }) => `
  .virtual-table .ant-table-container:before,
  .virtual-table .ant-table-container:after {
    display: none;
  }
  .virtual-table-cell {
    box-sizing: border-box;
    padding: ${theme.gridUnit * 4}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`,
);

const defaultLocale = {
  filterTitle: t('Filter menu'),
  filterConfirm: t('OK'),
  filterReset: t('Reset'),
  filterEmptyText: t('No filters'),
  filterCheckall: t('Select all items'),
  filterSearchPlaceholder: t('Search in filters'),
  emptyText: t('No data'),
  selectAll: t('Select current page'),
  selectInvert: t('Invert current page'),
  selectNone: t('Clear all data'),
  selectionAll: t('Select all data'),
  sortTitle: t('Sort'),
  expand: t('Expand row'),
  collapse: t('Collapse row'),
  triggerDesc: t('Click to sort descending'),
  triggerAsc: t('Click to sort ascending'),
  cancelSort: t('Click to cancel sorting'),
};

const selectionMap = {};
const noop = () => {};
selectionMap[SelectionType.MULTI] = 'checkbox';
selectionMap[SelectionType.SINGLE] = 'radio';
selectionMap[SelectionType.DISABLED] = null;

export function Table(props: TableProps) {
  const {
    data,
    columns,
    selectedRows = defaultRowSelection,
    handleRowSelection,
    size = TableSize.SMALL,
    selectionType = SelectionType.DISABLED,
    sticky = true,
    loading = false,
    resizable = false,
    reorderable = false,
    usePagination = true,
    defaultPageSize = 15,
    pageSizeOptions = ['5', '15', '25', '50', '100'],
    hideData = false,
    emptyComponent,
    locale,
    height,
    virtualize = false,
    onChange = noop,
    recordCount,
  } = props;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [derivedColumns, setDerivedColumns] = useState(columns);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [mergedLocale, setMergedLocale] = useState({ ...defaultLocale });
  const [selectedRowKeys, setSelectedRowKeys] =
    useState<React.Key[]>(selectedRows);
  const interactiveTableUtils = useRef<InteractiveTableUtils | null>(null);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    handleRowSelection?.(newSelectedRowKeys);
  };

  const selectionTypeValue = selectionMap[selectionType];
  const rowSelection = {
    type: selectionTypeValue,
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const renderEmpty = () =>
    emptyComponent ?? <div>{mergedLocale.emptyText}</div>;

  // Log use of experimental features
  useEffect(() => {
    if (reorderable === true) {
      logging.warn(
        'EXPERIMENTAL FEATURE ENABLED: The "reorderable" prop of Table is experimental and NOT recommended for use in production deployments.',
      );
    }
    if (resizable === true) {
      logging.warn(
        'EXPERIMENTAL FEATURE ENABLED: The "resizable" prop of Table is experimental and NOT recommended for use in production deployments.',
      );
    }
  }, [reorderable, resizable]);

  useEffect(() => {
    let updatedLocale;
    if (locale) {
      // This spread allows for locale to only contain a subset of locale overrides on props
      updatedLocale = { ...defaultLocale, ...locale };
    } else {
      updatedLocale = { ...defaultLocale };
    }
    setMergedLocale(updatedLocale);
  }, [locale]);

  useEffect(() => setDerivedColumns(columns), [columns]);

  useEffect(() => {
    if (interactiveTableUtils.current) {
      interactiveTableUtils.current?.clearListeners();
    }
    const table = wrapperRef.current?.getElementsByTagName('table')[0];
    if (table) {
      interactiveTableUtils.current = new InteractiveTableUtils(
        table,
        derivedColumns,
        setDerivedColumns,
      );
      if (reorderable) {
        interactiveTableUtils?.current?.initializeDragDropColumns(
          reorderable,
          table,
        );
      }
      if (resizable) {
        interactiveTableUtils?.current?.initializeResizableColumns(
          resizable,
          table,
        );
      }
    }
    return () => {
      interactiveTableUtils?.current?.clearListeners?.();
    };
    /**
     * We DO NOT want this effect to trigger when derivedColumns changes as it will break functionality
     * The exclusion from the effect dependencies is intentional and should not be modified
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef, reorderable, resizable, virtualize, interactiveTableUtils]);

  const theme = useTheme();

  const paginationSettings: IPaginationOptions | false = usePagination
    ? {
        hideOnSinglePage: true,
        pageSize,
        pageSizeOptions,
        onShowSizeChange: (page: number, size: number) => setPageSize(size),
      }
    : false;

  /**
   * When recordCount is provided it lets the user of Table control total number of pages
   * independent from data.length.  This allows the parent component do things like server side paging
   * where the user can be shown the total mount of data they can page through, but the component can provide
   * data one page at a time, and respond to the onPageChange event to fetch and set new data
   */
  if (paginationSettings && recordCount) {
    paginationSettings.total = recordCount;
  }

  let bodyHeight = height;
  if (bodyHeight) {
    bodyHeight -= HEADER_HEIGHT;
    const hasPagination =
      usePagination && recordCount && recordCount > pageSize;
    if (hasPagination) {
      bodyHeight -= PAGINATION_HEIGHT;
    }
  }

  const sharedProps = {
    loading: { spinning: loading ?? false, indicator: <Loading /> },
    hasData: hideData ? false : data,
    columns: derivedColumns,
    dataSource: hideData ? [undefined] : data,
    size,
    pagination: paginationSettings,
    locale: mergedLocale,
    showSorterTooltip: false,
    onChange,
    theme,
    height: bodyHeight,
  };

  return (
    <ConfigProvider renderEmpty={renderEmpty}>
      <div ref={wrapperRef}>
        {!virtualize && (
          <StyledTable
            {...sharedProps}
            rowSelection={selectionTypeValue ? rowSelection : undefined}
            sticky={sticky}
          />
        )}
        {virtualize && (
          <StyledVirtualTable
            {...sharedProps}
            scroll={{ y: 300, x: '100vw' }}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default Table;
