function EmployeesTable({ employees }) {
  if (employees.length === 0) {
    return null
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Nhan su</p>
          <h2>Danh sach nhan vien</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ho ten</th>
              <th>Email</th>
              <th>Dien thoai</th>
              <th>Vai tro</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>{employee.role?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default EmployeesTable
