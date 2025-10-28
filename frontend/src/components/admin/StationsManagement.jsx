// src/components/admin/StationsManagement.jsx
import React, { useState } from 'react';

const StationsManagement = () => {
  const [search, setSearch] = useState('');
  const [stations] = useState([
    { id: 1, name: 'Vincom Đồng Khởi', location: 'Quận 1', status: 'Hoạt động', ports: 8 },
    { id: 2, name: 'Saigon Centre', location: 'Quận 1', status: 'Đang sạc', ports: 6 },
    { id: 3, name: 'Lotte Mart Q7', location: 'Quận 7', status: 'Bảo trì', ports: 10 },
  ]);

  return (
    <div className="stations-management">
      <div className="page-header">
        <h2>Quản lý trạm sạc</h2>
        <button className="btn-add">+ Thêm trạm</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm trạm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên trạm</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Cổng sạc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station.id}>
                <td>#{station.id}</td>
                <td>{station.name}</td>
                <td>{station.location}</td>
                <td>
                  <span className={`status ${station.status.toLowerCase()}`}>
                    {station.status}
                  </span>
                </td>
                <td>{station.ports}</td>
                <td>
                  <button className="btn-edit">Sửa</button>
                  <button className="btn-delete">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationsManagement;