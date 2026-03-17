/**
 * Mock data generator for testing without Keboola credentials.
 * Generates realistic table metadata for visual verification.
 */

export function generateMockMetadata() {
  const tables = [
    {
      id: 'out.c-bdm.REF_CLIENT',
      name: 'REF_CLIENT',
      description: 'Reference table for clients and customer master data',
      primaryKey: ['CLIENT_ID'],
      rowsCount: 15420,
      dataSizeBytes: 2457600,
      columnCount: 6,
      columns: [
        { name: 'CLIENT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: 'Unique client identifier', length: null },
        { name: 'CLIENT_NAME', databaseNativeType: 'VARCHAR(255)', keboolaBaseType: 'STRING', nullable: false, description: 'Full client name', length: '255' },
        { name: 'EMAIL', databaseNativeType: 'VARCHAR(255)', keboolaBaseType: 'STRING', nullable: true, description: '', length: '255' },
        { name: 'COUNTRY_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: true, description: '', length: null },
        { name: 'STATUS', databaseNativeType: 'VARCHAR(20)', keboolaBaseType: 'STRING', nullable: false, description: 'Active/Inactive status', length: '20' },
        { name: 'CREATED_DATE', databaseNativeType: 'DATE', keboolaBaseType: 'DATE', nullable: true, description: '', length: null },
      ],
      bucket: 'out.c-bdm',
      category: 'REF',
      lastImportDate: '2026-03-05T14:30:00Z',
      tags: ['verified', 'core'],
    },
    {
      id: 'out.c-bdm.REF_PRODUCT',
      name: 'REF_PRODUCT',
      description: 'Product catalog reference data',
      primaryKey: ['PRODUCT_ID'],
      rowsCount: 3280,
      dataSizeBytes: 819200,
      columnCount: 5,
      columns: [
        { name: 'PRODUCT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: 'Unique product identifier', length: null },
        { name: 'PRODUCT_NAME', databaseNativeType: 'VARCHAR(255)', keboolaBaseType: 'STRING', nullable: false, description: 'Product display name', length: '255' },
        { name: 'CATEGORY_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: true, description: '', length: null },
        { name: 'PRICE', databaseNativeType: 'DECIMAL(10,2)', keboolaBaseType: 'NUMERIC', nullable: true, description: 'Unit price', length: '10,2' },
        { name: 'IS_ACTIVE', databaseNativeType: 'BOOLEAN', keboolaBaseType: 'BOOLEAN', nullable: false, description: '', length: null },
      ],
      bucket: 'out.c-bdm',
      category: 'REF',
      lastImportDate: '2026-03-04T10:00:00Z',
      tags: ['needs-review'],
    },
    {
      id: 'out.c-bdm.REF_COUNTRY',
      name: 'REF_COUNTRY',
      description: 'Country reference table',
      primaryKey: ['COUNTRY_ID'],
      rowsCount: 195,
      dataSizeBytes: 24576,
      columnCount: 3,
      columns: [
        { name: 'COUNTRY_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: 'Unique country identifier', length: null },
        { name: 'COUNTRY_NAME', databaseNativeType: 'VARCHAR(100)', keboolaBaseType: 'STRING', nullable: false, description: 'Country name', length: '100' },
        { name: 'COUNTRY_CODE', databaseNativeType: 'VARCHAR(3)', keboolaBaseType: 'STRING', nullable: false, description: 'ISO 3166 code', length: '3' },
      ],
      bucket: 'out.c-bdm',
      category: 'REF',
      lastImportDate: '2026-02-28T08:00:00Z',
      tags: ['verified'],
    },
    {
      id: 'out.c-bdm.REF_CATEGORY',
      name: 'REF_CATEGORY',
      description: '',
      primaryKey: ['CATEGORY_ID'],
      rowsCount: 42,
      dataSizeBytes: 4096,
      columnCount: 2,
      columns: [
        { name: 'CATEGORY_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'CATEGORY_NAME', databaseNativeType: 'VARCHAR(100)', keboolaBaseType: 'STRING', nullable: false, description: '', length: '100' },
      ],
      bucket: 'out.c-bdm',
      category: 'REF',
      lastImportDate: '2026-03-01T12:00:00Z',
      tags: [],
    },
    {
      id: 'out.c-bdm.DIM_DATE',
      name: 'DIM_DATE',
      description: 'Date dimension with calendar attributes',
      primaryKey: ['DATE_ID'],
      rowsCount: 36500,
      dataSizeBytes: 5242880,
      columnCount: 6,
      columns: [
        { name: 'DATE_ID', databaseNativeType: 'DATE', keboolaBaseType: 'DATE', nullable: false, description: 'Date key', length: null },
        { name: 'YEAR', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'MONTH', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'DAY', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'QUARTER', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'DAY_OF_WEEK', databaseNativeType: 'VARCHAR(10)', keboolaBaseType: 'STRING', nullable: false, description: '', length: '10' },
      ],
      bucket: 'out.c-bdm',
      category: 'DIM',
      lastImportDate: '2026-03-06T00:00:00Z',
      tags: ['core'],
    },
    {
      id: 'out.c-bdm.DIM_STORE',
      name: 'DIM_STORE',
      description: '',
      primaryKey: ['STORE_ID'],
      rowsCount: 450,
      dataSizeBytes: 102400,
      columnCount: 4,
      columns: [
        { name: 'STORE_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'STORE_NAME', databaseNativeType: 'VARCHAR(100)', keboolaBaseType: 'STRING', nullable: false, description: '', length: '100' },
        { name: 'COUNTRY_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: true, description: '', length: null },
        { name: 'OPENED_DATE', databaseNativeType: 'DATE', keboolaBaseType: 'DATE', nullable: true, description: '', length: null },
      ],
      bucket: 'out.c-bdm',
      category: 'DIM',
      lastImportDate: '2026-03-05T09:00:00Z',
      tags: ['wip'],
    },
    {
      id: 'out.c-bdm.FCT_ORDER',
      name: 'FCT_ORDER',
      description: 'Fact table for customer orders',
      primaryKey: ['ORDER_ID'],
      rowsCount: 1250000,
      dataSizeBytes: 524288000,
      columnCount: 7,
      columns: [
        { name: 'ORDER_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: 'Unique order identifier', length: null },
        { name: 'CLIENT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: 'FK to REF_CLIENT', length: null },
        { name: 'PRODUCT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'STORE_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: true, description: '', length: null },
        { name: 'ORDER_DATE', databaseNativeType: 'DATE', keboolaBaseType: 'DATE', nullable: false, description: 'Date of the order', length: null },
        { name: 'QUANTITY', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'TOTAL_AMOUNT', databaseNativeType: 'DECIMAL(12,2)', keboolaBaseType: 'NUMERIC', nullable: false, description: 'Order total in EUR', length: '12,2' },
      ],
      bucket: 'out.c-bdm',
      category: 'FCT',
      lastImportDate: '2026-03-06T06:00:00Z',
      tags: ['core', 'verified'],
    },
    {
      id: 'out.c-bdm.FCT_PAYMENT',
      name: 'FCT_PAYMENT',
      description: 'Payment transactions linked to orders',
      primaryKey: ['PAYMENT_ID'],
      rowsCount: 890000,
      dataSizeBytes: 209715200,
      columnCount: 5,
      columns: [
        { name: 'PAYMENT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'ORDER_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'PAYMENT_DATE', databaseNativeType: 'TIMESTAMP', keboolaBaseType: 'TIMESTAMP', nullable: false, description: '', length: null },
        { name: 'AMOUNT', databaseNativeType: 'DECIMAL(12,2)', keboolaBaseType: 'NUMERIC', nullable: false, description: '', length: '12,2' },
        { name: 'PAYMENT_METHOD', databaseNativeType: 'VARCHAR(30)', keboolaBaseType: 'STRING', nullable: true, description: '', length: '30' },
      ],
      bucket: 'out.c-bdm',
      category: 'FCT',
      lastImportDate: '2026-03-06T06:00:00Z',
      tags: [],
    },
    {
      id: 'out.c-bdm.MAP_ORDER_PRODUCT',
      name: 'MAP_ORDER_PRODUCT',
      description: 'Mapping table between orders and products (line items)',
      primaryKey: ['ORDER_ID', 'PRODUCT_ID'],
      rowsCount: 3200000,
      dataSizeBytes: 419430400,
      columnCount: 4,
      columns: [
        { name: 'ORDER_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'PRODUCT_ID', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'QUANTITY', databaseNativeType: 'INTEGER', keboolaBaseType: 'INTEGER', nullable: false, description: '', length: null },
        { name: 'LINE_TOTAL', databaseNativeType: 'DECIMAL(10,2)', keboolaBaseType: 'NUMERIC', nullable: false, description: '', length: '10,2' },
      ],
      bucket: 'out.c-bdm',
      category: 'MAP',
      lastImportDate: '2026-03-06T06:00:00Z',
      tags: [],
    },
    {
      id: 'out.c-bdm_aux.AUX_STAGING_ORDERS',
      name: 'AUX_STAGING_ORDERS',
      description: '',
      primaryKey: [],
      rowsCount: 0,
      dataSizeBytes: 0,
      columnCount: 3,
      columns: [
        { name: 'RAW_DATA', databaseNativeType: 'VARCHAR(16777216)', keboolaBaseType: 'STRING', nullable: true, description: '', length: null },
        { name: 'SOURCE', databaseNativeType: 'VARCHAR(50)', keboolaBaseType: 'STRING', nullable: true, description: '', length: '50' },
        { name: 'LOADED_AT', databaseNativeType: 'TIMESTAMP', keboolaBaseType: 'TIMESTAMP', nullable: true, description: '', length: null },
      ],
      bucket: 'out.c-bdm_aux',
      category: 'AUX',
      lastImportDate: null,
      tags: ['deprecated'],
    },
  ];

  const edges = [
    { id: 'FCT_ORDER.CLIENT_ID→REF_CLIENT', source: 'FCT_ORDER', target: 'REF_CLIENT', sourceColumn: 'CLIENT_ID', targetColumn: 'CLIENT_ID', label: 'CLIENT', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'FCT_ORDER.PRODUCT_ID→REF_PRODUCT', source: 'FCT_ORDER', target: 'REF_PRODUCT', sourceColumn: 'PRODUCT_ID', targetColumn: 'PRODUCT_ID', label: 'PRODUCT', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'FCT_ORDER.STORE_ID→DIM_STORE', source: 'FCT_ORDER', target: 'DIM_STORE', sourceColumn: 'STORE_ID', targetColumn: 'STORE_ID', label: 'STORE', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'FCT_PAYMENT.ORDER_ID→FCT_ORDER', source: 'FCT_PAYMENT', target: 'FCT_ORDER', sourceColumn: 'ORDER_ID', targetColumn: 'ORDER_ID', label: 'ORDER', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'MAP_ORDER_PRODUCT.ORDER_ID→FCT_ORDER', source: 'MAP_ORDER_PRODUCT', target: 'FCT_ORDER', sourceColumn: 'ORDER_ID', targetColumn: 'ORDER_ID', label: 'ORDER', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'MAP_ORDER_PRODUCT.PRODUCT_ID→REF_PRODUCT', source: 'MAP_ORDER_PRODUCT', target: 'REF_PRODUCT', sourceColumn: 'PRODUCT_ID', targetColumn: 'PRODUCT_ID', label: 'PRODUCT', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'REF_CLIENT.COUNTRY_ID→REF_COUNTRY', source: 'REF_CLIENT', target: 'REF_COUNTRY', sourceColumn: 'COUNTRY_ID', targetColumn: 'COUNTRY_ID', label: 'COUNTRY', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'REF_PRODUCT.CATEGORY_ID→REF_CATEGORY', source: 'REF_PRODUCT', target: 'REF_CATEGORY', sourceColumn: 'CATEGORY_ID', targetColumn: 'CATEGORY_ID', label: 'CATEGORY', cardinality: 'M:1', inferenceMethod: 'direct' },
    { id: 'DIM_STORE.COUNTRY_ID→REF_COUNTRY', source: 'DIM_STORE', target: 'REF_COUNTRY', sourceColumn: 'COUNTRY_ID', targetColumn: 'COUNTRY_ID', label: 'COUNTRY', cardinality: 'M:1', inferenceMethod: 'direct' },
  ];

  const dateEdges = [
    { id: 'date:FCT_ORDER.ORDER_DATE→DIM_DATE', source: 'FCT_ORDER', target: 'DIM_DATE', sourceColumn: 'ORDER_DATE', targetColumn: 'DATE_ID', label: 'ORDER_DATE', cardinality: 'M:1', inferenceMethod: 'date-assumed' },
    { id: 'date:FCT_PAYMENT.PAYMENT_DATE→DIM_DATE', source: 'FCT_PAYMENT', target: 'DIM_DATE', sourceColumn: 'PAYMENT_DATE', targetColumn: 'DATE_ID', label: 'PAYMENT_DATE', cardinality: 'M:1', inferenceMethod: 'date-assumed' },
    { id: 'date:REF_CLIENT.CREATED_DATE→DIM_DATE', source: 'REF_CLIENT', target: 'DIM_DATE', sourceColumn: 'CREATED_DATE', targetColumn: 'DATE_ID', label: 'CREATED_DATE', cardinality: 'M:1', inferenceMethod: 'date-assumed' },
    { id: 'date:DIM_STORE.OPENED_DATE→DIM_DATE', source: 'DIM_STORE', target: 'DIM_DATE', sourceColumn: 'OPENED_DATE', targetColumn: 'DATE_ID', label: 'OPENED_DATE', cardinality: 'M:1', inferenceMethod: 'date-assumed' },
  ];

  const categories = {};
  for (const t of tables) {
    categories[t.name] = t.category;
    // Add mock Keboola URL for each table
    t.keboolaUrl = `#mock/storage/tables/${t.id}`;
  }

  // Mock lineage data — all component types producing and using tables
  const lineage = {
    producedBy: {
      'out.c-bdm.REF_CLIENT': [
        {
          configId: '201',
          configName: 'Salesforce CRM',
          componentId: 'kds-team.ex-salesforce-v2',
          componentType: 'EXT',
          componentCategory: 'extractor',
          lastChangeDate: new Date(Date.now() - 3 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 2 * 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/components/kds-team.ex-salesforce-v2/201',
        },
      ],
      'out.c-bdm.REF_PRODUCT': [
        {
          configId: '202',
          configName: 'Oracle Navigator',
          componentId: 'keboola.ex-db-oracle',
          componentType: 'EXT',
          componentCategory: 'extractor',
          lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 30 * 60000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/components/keboola.ex-db-oracle/202',
        },
      ],
      'out.c-bdm.FCT_ORDER': [
        {
          configId: '101',
          configName: 'Build FCT Order',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/101',
        },
      ],
      'out.c-bdm.FCT_PAYMENT': [
        {
          configId: '102',
          configName: 'Build FCT Payment',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 2 * 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/102',
        },
      ],
      'out.c-bdm.MAP_ORDER_PRODUCT': [
        {
          configId: '101',
          configName: 'Build FCT Order',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/101',
        },
      ],
    },
    usedBy: {
      'out.c-bdm.REF_CLIENT': [
        {
          configId: '101',
          configName: 'Build FCT Order',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/101',
        },
        {
          configId: '103',
          configName: 'Export Client Report',
          componentId: 'keboola.python-transformation-v2',
          componentType: 'PY',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 86400000).toISOString(),
          lastRunStatus: 'error',
          keboolaUrl: '#mock/transformations/keboola.python-transformation-v2/103',
        },
      ],
      'out.c-bdm.REF_PRODUCT': [
        {
          configId: '101',
          configName: 'Build FCT Order',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/101',
        },
      ],
      'out.c-bdm.FCT_ORDER': [
        {
          configId: '102',
          configName: 'Build FCT Payment',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 2 * 3600000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/102',
        },
        {
          configId: '104',
          configName: 'Enrich Dispatch Data',
          componentId: 'keboola.snowflake-transformation',
          componentType: 'SQL',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 4 * 3600000).toISOString(),
          lastRunStatus: 'warning',
          keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/104',
        },
      ],
      'out.c-bdm.FCT_PAYMENT': [
        {
          configId: '103',
          configName: 'Export Client Report',
          componentId: 'keboola.python-transformation-v2',
          componentType: 'PY',
          componentCategory: 'transformation',
          lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 86400000).toISOString(),
          lastRunStatus: 'error',
          keboolaUrl: '#mock/transformations/keboola.python-transformation-v2/103',
        },
        {
          configId: '301',
          configName: 'Data Quality Monitor',
          componentId: 'kds-team.app-custom-python',
          componentType: 'APP',
          componentCategory: 'application',
          lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          lastRunDate: new Date(Date.now() - 30 * 60000).toISOString(),
          lastRunStatus: 'success',
          keboolaUrl: '#mock/components/kds-team.app-custom-python/301',
        },
      ],
    },
  };

  // Mock component configs for documentation page
  const componentConfigs = [
    {
      componentId: 'keboola.ex-db-oracle',
      componentName: 'Oracle Database',
      componentType: 'extractor',
      configId: '202',
      configName: '[PROD] Oracledb Navigator',
      description: 'Production extraction from Oracle Navigator ERP system. Extracts 38 tables including orders, dispatches, invoices, and reference data.',
      lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      version: 12,
      inputTables: [],
      outputTables: ['out.c-bdm.REF_PRODUCT', 'out.c-bdm.REF_CLIENT'],
      keboolaUrl: '#mock/components/keboola.ex-db-oracle/202',
    },
    {
      componentId: 'kds-team.ex-salesforce-v2',
      componentName: 'Salesforce',
      componentType: 'extractor',
      configId: '201',
      configName: 'Salesforce CRM',
      description: 'Extracts CRM data including accounts, contacts, opportunities, and leads.',
      lastChangeDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      version: 5,
      inputTables: [],
      outputTables: ['out.c-bdm.REF_CLIENT'],
      keboolaUrl: '#mock/components/kds-team.ex-salesforce-v2/201',
    },
    {
      componentId: 'keboola.snowflake-transformation',
      componentName: 'Snowflake SQL',
      componentType: 'transformation',
      configId: '101',
      configName: 'BDM - L1 - Order',
      description: 'Builds the FCT_ORDER fact table from STG_ORDER with status enrichment, date calculations, and FK resolution to REF_CLIENT, REF_CARRIER, and REF_OFFICE.',
      lastChangeDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      version: 8,
      inputTables: ['out.c-bdm.REF_CLIENT', 'out.c-bdm.REF_PRODUCT'],
      outputTables: ['out.c-bdm.FCT_ORDER', 'out.c-bdm.MAP_ORDER_PRODUCT'],
      keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/101',
    },
    {
      componentId: 'keboola.snowflake-transformation',
      componentName: 'Snowflake SQL',
      componentType: 'transformation',
      configId: '102',
      configName: 'BDM - L2 - Payment',
      description: 'Builds the FCT_PAYMENT fact table from raw payment data with currency conversion and invoice linkage.',
      lastChangeDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      version: 4,
      inputTables: ['out.c-bdm.FCT_ORDER'],
      outputTables: ['out.c-bdm.FCT_PAYMENT'],
      keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/102',
    },
    {
      componentId: 'keboola.snowflake-transformation',
      componentName: 'Snowflake SQL',
      componentType: 'transformation',
      configId: '103',
      configName: 'AUX - Currency Rates',
      description: 'Loads and maintains currency exchange rate lookup tables from ECB daily feed.',
      lastChangeDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      version: 2,
      inputTables: ['in.c-oracle_navigator.EXCHANGE_RATES'],
      outputTables: ['out.c-bdm_aux.AUX_CURRENCY_RATES'],
      keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/103',
    },
    {
      componentId: 'keboola.python-transformation-v2',
      componentName: 'Python',
      componentType: 'transformation',
      configId: '104',
      configName: 'UC - Client Mapping',
      description: 'Python transformation that maps client identifiers across source systems using fuzzy matching.',
      lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      version: 6,
      inputTables: ['out.c-bdm.REF_CLIENT', 'in.c-netsuite.CUSTOMERS'],
      outputTables: ['out.c-bdm.MAP_CLIENT_XREF'],
      keboolaUrl: '#mock/transformations/keboola.python-transformation-v2/104',
    },
    {
      componentId: 'keboola.snowflake-transformation',
      componentName: 'Snowflake SQL',
      componentType: 'transformation',
      configId: '105',
      configName: 'BI - Dashboard Aggregates',
      description: 'Pre-aggregates order and payment data for BI dashboard consumption.',
      lastChangeDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      version: 3,
      inputTables: ['out.c-bdm.FCT_ORDER', 'out.c-bdm.FCT_PAYMENT'],
      outputTables: ['out.c-bi_reporting.RPT_DAILY_ORDERS'],
      keboolaUrl: '#mock/transformations/keboola.snowflake-transformation/105',
    },
    {
      componentId: 'keboola.app-data-gateway',
      componentName: 'Keboola Data Gateway',
      componentType: 'application',
      configId: '401',
      configName: 'BI Data Gateway',
      description: '## Metabase reporting data delivery\n\nPushes BDM tables to external Snowflake for BI consumption. Uses clone mode for all tables.',
      lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      version: 3,
      inputTables: ['out.c-bdm.FCT_ORDER', 'out.c-bdm.REF_CLIENT', 'out.c-bdm.REF_PRODUCT'],
      outputTables: [],
      rows: [
        { name: 'FCT_ORDER', description: '', inputTables: ['out.c-bdm.FCT_ORDER'], incremental: false, tableId: 'out.c-bdm.FCT_ORDER', dbName: 'FCT_ORDER' },
        { name: 'REF_CLIENT', description: '', inputTables: ['out.c-bdm.REF_CLIENT'], incremental: false, tableId: 'out.c-bdm.REF_CLIENT', dbName: 'REF_CLIENT' },
        { name: 'REF_PRODUCT', description: '', inputTables: ['out.c-bdm.REF_PRODUCT'], incremental: false, tableId: 'out.c-bdm.REF_PRODUCT', dbName: 'REF_PRODUCT' },
      ],
      connectionInfo: {
        host: 'example.eu-west-2.aws.snowflakecomputing.com',
        schema: 'READER_SCHEMA',
        warehouse: 'READER_WH',
        loginType: 'snowflake-service-keypair',
        driver: 'snowflake',
      },
      keboolaUrl: '#mock/components/keboola.app-data-gateway/401',
    },
    {
      componentId: 'kds-team.app-custom-python',
      componentName: 'Custom Python',
      componentType: 'application',
      configId: '301',
      configName: 'Data Quality Monitor',
      description: 'Custom Python application that monitors data quality metrics across BDM tables.',
      lastChangeDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      version: 2,
      inputTables: ['out.c-bdm.FCT_PAYMENT'],
      outputTables: [],
      keboolaUrl: '#mock/components/kds-team.app-custom-python/301',
    },
  ];

  // Mock flows for orchestration section
  const flows = [
    {
      id: 'flow-1',
      name: 'BDM - Daily Flow',
      description: 'Main daily pipeline: extractors → staging → reference → facts',
      componentId: 'keboola.flow',
      isDisabled: false,
      phases: [
        { id: 'phase-1', name: 'L0 - AUX & STG', description: '', dependsOn: [], hasConditions: false },
        { id: 'phase-2', name: 'L1 - REF & MAP', description: '', dependsOn: ['phase-1'], hasConditions: false },
        { id: 'phase-3', name: 'L1 - FCT', description: '', dependsOn: ['phase-2'], hasConditions: false },
      ],
      tasks: [
        { id: 't1', name: '[UAT] FCT_ORDER', phaseId: 'phase-3', enabled: true, componentId: 'keboola.snowflake-transformation', configId: '101' },
        { id: 't2', name: '[UAT] FCT_PAYMENT', phaseId: 'phase-3', enabled: true, componentId: 'keboola.snowflake-transformation', configId: '102' },
      ],
      phaseCount: 3,
      taskCount: 2,
      keboolaUrl: '#mock/flows/flow-1',
    },
  ];

  // Mock data apps
  const dataApps = [
    {
      id: 'app-1',
      name: 'Data Catalog',
      description: 'A data application for BDM exploration and documentation.',
      type: 'python-js',
      gitRepository: 'https://github.com/example/bdm_data_dictionary',
      gitBranch: 'main',
      authType: 'password',
      deploymentUrl: 'https://data-catalog-mock.hub.keboola.com',
      autoSuspendAfterSeconds: 900,
      appId: '12345',
      keboolaUrl: '#mock/data-apps/app-1',
    },
  ];

  // Mock all buckets for storage documentation
  const allBuckets = [
    {
      id: 'in.c-oracle_navigator',
      name: 'c-oracle_navigator',
      stage: 'in',
      description: 'Raw data from Oracle Navigator ERP system',
      tables: [
        { id: 'in.c-oracle_navigator.ORDERS', name: 'ORDERS', description: 'Raw orders from Navigator', columnCount: 15 },
        { id: 'in.c-oracle_navigator.DISPATCHES', name: 'DISPATCHES', description: 'Dispatch records', columnCount: 22 },
        { id: 'in.c-oracle_navigator.INVOICES', name: 'INVOICES', description: 'Invoice data', columnCount: 18 },
      ],
    },
    {
      id: 'in.c-netsuite',
      name: 'c-netsuite',
      stage: 'in',
      description: 'NetSuite accounting data',
      tables: [
        { id: 'in.c-netsuite.GL_TRANSACTIONS', name: 'GL_TRANSACTIONS', description: 'General ledger transactions', columnCount: 10 },
        { id: 'in.c-netsuite.ACCOUNTS', name: 'ACCOUNTS', description: 'Chart of accounts', columnCount: 8 },
      ],
    },
    {
      id: 'out.c-bdm',
      name: 'c-bdm',
      stage: 'out',
      description: 'Business Data Model — production output',
      tables: tables.filter(t => t.bucket === 'out.c-bdm').map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        columnCount: t.columns.length,
      })),
    },
    {
      id: 'out.c-bdm_aux',
      name: 'c-bdm_aux',
      stage: 'out',
      description: 'BDM auxiliary/staging tables',
      tables: tables.filter(t => t.bucket === 'out.c-bdm_aux').map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        columnCount: t.columns.length,
      })),
    },
    {
      id: 'out.c-bi_reporting',
      name: 'c-bi_reporting',
      stage: 'out',
      description: 'Pre-aggregated tables for BI dashboards',
      tables: [
        { id: 'out.c-bi_reporting.RPT_DAILY_REVENUE', name: 'RPT_DAILY_REVENUE', description: 'Daily revenue summary', columnCount: 6 },
        { id: 'out.c-bi_reporting.RPT_CLIENT_SUMMARY', name: 'RPT_CLIENT_SUMMARY', description: 'Client-level summary stats', columnCount: 9 },
      ],
    },
  ];

  return {
    tables,
    edges,
    dateEdges,
    categories,
    lineage,
    componentConfigs,
    flows,
    dataApps,
    allBuckets,
    lastRefresh: new Date().toISOString(),
    stats: {
      totalColumns: tables.reduce((acc, t) => acc + t.columns.length, 0),
      idColumns: 12,
      matched: 9,
      skipped: 0,
      aliased: 0,
      unmatched: 1,
      selfRefSkipped: 6,
    },
  };
}

/**
 * Generate mock profiling data for a table.
 * Produces realistic stats per column matching the ProfilingCache response shape.
 *
 * @param {object} table - Table object from generateMockMetadata()
 * @returns {object} Mock profile matching TableProfile interface
 */
export function generateMockProfile(table) {
  if (!table || table.rowsCount === 0) {
    return {
      tableId: table?.id || 'unknown',
      sampleSize: 0,
      totalRows: 0,
      profiledAt: new Date().toISOString(),
      hasNativeProfile: true,
      columns: (table?.columns || []).map((col) => ({
        columnName: col.name,
        nullCount: 0,
        nullRate: 0,
        distinctCount: 0,
        duplicateCount: 0,
        isExact: true,
        min: null,
        max: null,
        novalueCount: 0,
        novalueRate: 0,
        topValues: [],
        sampleValues: [],
      })),
    };
  }

  const sampleSize = Math.min(1000, table.rowsCount);
  const totalRows = table.rowsCount;
  const isPK = new Set(table.primaryKey || []);

  const columns = table.columns.map((col) => {
    const isId = col.name.endsWith('_ID');
    const isPrimary = isPK.has(col.name);
    const baseType = (col.keboolaBaseType || 'STRING').toUpperCase();

    // PKs: no nulls, fully unique
    if (isPrimary) {
      return {
        columnName: col.name,
        nullCount: 0,
        nullRate: 0,
        distinctCount: totalRows,
        duplicateCount: 0,
        isExact: true,
        min: baseType === 'INTEGER' ? 1 : null,
        max: baseType === 'INTEGER' ? totalRows : null,
        novalueCount: 0,
        novalueRate: 0,
        topValues: [],
        sampleValues: baseType === 'INTEGER'
          ? ['1', '2', '3', '4', '5']
          : baseType === 'DATE'
            ? ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05']
            : [],
      };
    }

    // Nullable FK _ID columns: some $NOVALUE
    if (isId && col.nullable) {
      const novalueRate = _mockRandom(0.02, 0.22);
      const novalueCount = Math.round(sampleSize * novalueRate);
      const nullRate = _mockRandom(0, 0.05);
      const nullCount = Math.round(totalRows * nullRate);
      const distinctCount = Math.round(totalRows * _mockRandom(0.001, 0.1));
      return {
        columnName: col.name,
        nullCount,
        nullRate,
        distinctCount,
        duplicateCount: Math.max(0, totalRows - nullCount - distinctCount),
        isExact: true,
        min: 1,
        max: Math.round(_mockRandom(500, 50000)),
        novalueCount,
        novalueRate,
        topValues: [
          { value: '$NOVALUE', count: novalueCount },
          { value: String(Math.round(_mockRandom(1, 100))), count: Math.round(sampleSize * 0.05) },
          { value: String(Math.round(_mockRandom(100, 500))), count: Math.round(sampleSize * 0.03) },
        ],
        sampleValues: ['$NOVALUE', '42', '187', '1003', '2891'],
      };
    }

    // Non-nullable FK _ID columns: no $NOVALUE
    if (isId) {
      const distinctCount = Math.round(totalRows * _mockRandom(0.01, 0.5));
      return {
        columnName: col.name,
        nullCount: 0,
        nullRate: 0,
        distinctCount,
        duplicateCount: Math.max(0, totalRows - distinctCount),
        isExact: true,
        min: 1,
        max: Math.round(_mockRandom(1000, 20000)),
        novalueCount: 0,
        novalueRate: 0,
        topValues: [
          { value: String(Math.round(_mockRandom(1, 50))), count: Math.round(sampleSize * 0.08) },
          { value: String(Math.round(_mockRandom(50, 200))), count: Math.round(sampleSize * 0.05) },
          { value: String(Math.round(_mockRandom(200, 500))), count: Math.round(sampleSize * 0.04) },
        ],
        sampleValues: ['1', '23', '456', '789', '1234'],
      };
    }

    // Numeric columns
    if (['INTEGER', 'NUMERIC', 'FLOAT'].includes(baseType)) {
      const nullRate = col.nullable ? _mockRandom(0, 0.08) : 0;
      const nullCount = Math.round(totalRows * nullRate);
      const min = baseType === 'INTEGER' ? Math.round(_mockRandom(0, 10)) : _mockRound(_mockRandom(0.01, 100), 2);
      const max = baseType === 'INTEGER' ? Math.round(_mockRandom(100, 999999)) : _mockRound(_mockRandom(100, 50000), 2);
      const distinctCount = Math.round((totalRows - nullCount) * _mockRandom(0.3, 0.95));
      return {
        columnName: col.name,
        nullCount,
        nullRate,
        distinctCount,
        duplicateCount: Math.max(0, totalRows - nullCount - distinctCount),
        isExact: true,
        min,
        max,
        novalueCount: 0,
        novalueRate: 0,
        topValues: [
          { value: String(min), count: Math.round(sampleSize * 0.02) },
          { value: String(Math.round((min + max) / 2)), count: Math.round(sampleSize * 0.015) },
        ],
        sampleValues: [String(min), String(Math.round(max * 0.25)), String(Math.round(max * 0.5)), String(Math.round(max * 0.75)), String(max)],
      };
    }

    // Date/Timestamp columns
    if (['DATE', 'TIMESTAMP'].includes(baseType)) {
      const nullRate = col.nullable ? _mockRandom(0, 0.03) : 0;
      const nullCount = Math.round(totalRows * nullRate);
      return {
        columnName: col.name,
        nullCount,
        nullRate,
        distinctCount: Math.round((totalRows - nullCount) * _mockRandom(0.5, 1)),
        duplicateCount: Math.round(totalRows * _mockRandom(0, 0.3)),
        isExact: true,
        min: '2020-01-01',
        max: '2026-03-06',
        novalueCount: 0,
        novalueRate: 0,
        topValues: [
          { value: '2026-03-06', count: Math.round(sampleSize * 0.04) },
          { value: '2026-03-05', count: Math.round(sampleSize * 0.035) },
        ],
        sampleValues: ['2020-01-15', '2022-06-01', '2024-11-20', '2025-08-12', '2026-03-01'],
      };
    }

    // Boolean columns
    if (baseType === 'BOOLEAN') {
      return {
        columnName: col.name,
        nullCount: 0,
        nullRate: 0,
        distinctCount: 2,
        duplicateCount: totalRows - 2,
        isExact: true,
        min: 'false',
        max: 'true',
        novalueCount: 0,
        novalueRate: 0,
        topValues: [
          { value: 'true', count: Math.round(sampleSize * 0.72) },
          { value: 'false', count: Math.round(sampleSize * 0.28) },
        ],
        sampleValues: ['true', 'false'],
      };
    }

    // String columns (default)
    const nullRate = col.nullable ? _mockRandom(0, 0.12) : 0;
    const nullCount = Math.round(totalRows * nullRate);
    const distinctCount = Math.min(totalRows - nullCount, Math.round(_mockRandom(5, 500)));
    return {
      columnName: col.name,
      nullCount,
      nullRate,
      distinctCount,
      duplicateCount: Math.max(0, totalRows - nullCount - distinctCount),
      isExact: true,
      min: null,
      max: null,
      novalueCount: 0,
      novalueRate: 0,
      topValues: [
        { value: 'Active', count: Math.round(sampleSize * 0.45) },
        { value: 'Inactive', count: Math.round(sampleSize * 0.3) },
        { value: 'Pending', count: Math.round(sampleSize * 0.15) },
      ],
      sampleValues: ['Active', 'Inactive', 'Pending', 'Archived', 'Draft'],
    };
  });

  return {
    tableId: table.id,
    sampleSize,
    totalRows,
    profiledAt: new Date().toISOString(),
    hasNativeProfile: true,
    columns,
  };
}

/**
 * Generate mock data preview rows for a table.
 */
export function generateMockPreview(table, limit = 20) {
  if (!table || table.rowsCount === 0) {
    return { columns: table?.columns?.map((c) => c.name) || [], rows: [], totalAvailable: 0 };
  }
  const columns = table.columns.map((c) => c.name);
  const count = Math.min(limit, table.rowsCount, 20);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const row = {};
    for (const col of table.columns) {
      row[col.name] = _generateMockCell(col, i, table.primaryKey || []);
    }
    rows.push(row);
  }
  return { columns, rows, totalAvailable: count };
}

function _generateMockCell(col, rowIndex, primaryKey) {
  const baseType = (col.keboolaBaseType || 'STRING').toUpperCase();
  const isPK = primaryKey.includes(col.name);
  const isId = col.name.endsWith('_ID');

  if (isPK) return String(rowIndex + 1);

  if (isId) {
    // Occasionally return $NOVALUE for nullable FK columns
    if (col.nullable && rowIndex % 7 === 0) return '$NOVALUE';
    return String(Math.round(Math.random() * 9999) + 1);
  }

  if (baseType === 'INTEGER') return String(Math.round(Math.random() * 10000));
  if (baseType === 'NUMERIC' || baseType === 'FLOAT') return (Math.random() * 1000).toFixed(2);
  if (baseType === 'BOOLEAN') return Math.random() > 0.3 ? 'true' : 'false';

  if (baseType === 'DATE') {
    const d = new Date(2023, 0, 1 + Math.floor(Math.random() * 1000));
    return d.toISOString().split('T')[0];
  }
  if (baseType === 'TIMESTAMP') {
    const d = new Date(2023, 0, 1 + Math.floor(Math.random() * 1000));
    return d.toISOString().replace('T', ' ').slice(0, 19);
  }

  // String type — use column name hints for realistic data
  const name = col.name.toUpperCase();
  if (name.includes('NAME')) return ['Acme Corp', 'Global Trade', 'Sky Cargo', 'Fast Ship', 'Air One', 'Euro Freight', 'Nordic Express', 'Sea Bridge', 'Trade Link', 'Apex Logistics'][rowIndex % 10];
  if (name.includes('EMAIL')) return `user${rowIndex + 1}@example.com`;
  if (name.includes('STATUS')) return ['Active', 'Inactive', 'Pending', 'Completed'][rowIndex % 4];
  if (name.includes('CODE')) return ['US', 'GB', 'DE', 'FR', 'CZ', 'NL', 'AT', 'PL'][rowIndex % 8];
  if (name.includes('TYPE')) return ['Standard', 'Express', 'Economy', 'Premium'][rowIndex % 4];
  if (name.includes('METHOD')) return ['Credit Card', 'Wire Transfer', 'PayPal', 'Invoice'][rowIndex % 4];
  if (name.includes('CURRENCY')) return ['USD', 'EUR', 'GBP', 'CZK'][rowIndex % 4];
  if (name.includes('COUNTRY')) return ['United States', 'Germany', 'France', 'Czech Republic', 'Netherlands'][rowIndex % 5];
  if (name.includes('CITY')) return ['Prague', 'Berlin', 'Paris', 'Amsterdam', 'Vienna', 'London'][rowIndex % 6];
  if (name.includes('DESCRIPTION') || name.includes('NOTE')) return `Sample description for row ${rowIndex + 1}`;
  if (name.includes('PHONE')) return `+1-555-${String(1000 + rowIndex).padStart(4, '0')}`;
  return `val_${rowIndex + 1}`;
}

/** Seeded random for reproducible mock data within a range. */
function _mockRandom(min, max) {
  return min + Math.random() * (max - min);
}

/** Round to N decimal places. */
function _mockRound(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
