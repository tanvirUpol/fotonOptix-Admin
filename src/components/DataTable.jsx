import React from 'react';

const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-teal-700 text-white">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="py-2 px-4 text-left text-xs font-medium  uppercase tracking-wider border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-100">
              {headers.map((header) => (
                <td
                  key={header}
                  className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 border-b border-gray-200"
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
