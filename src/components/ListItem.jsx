import React from 'react'

export default function ListItem({message, func}) {
  return (
    <tr onClick={() => func()}>
        <td>{message.from.name}</td>
        <td>{message.subject}</td>
        <td><i className="fas fa-chevron-right"></i></td>
    </tr>
  )
}
