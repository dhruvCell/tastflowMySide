import React from 'react'
import "./Sidebar.css"
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { Howl } from 'howler';
const clickOption = new Howl({ src: ['/sounds/click.mp3'] });

const Sidebar = ({showAlert}) => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/admin/add' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-solid fa-circle-plus" style={{fontSize:"1.3rem"}}></i>
            <p>Add Items</p>
        </NavLink>

        <NavLink to='/admin/list' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-solid fa-list-check" style={{fontSize:"1.3rem"}}></i>
            <p>List Items</p>
        </NavLink>

        <NavLink to='/admin/admin-table' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <img src={assets.table_resrvation} alt="" />
            <p>Tables</p>
        </NavLink>
        <NavLink to='/admin/all-users' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-solid fa-users" style={{fontSize:"1.3rem"}}></i>
            <p>User Data</p>
        </NavLink>
        <NavLink to='/admin/all-reviews' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-regular fa-comments" style={{fontSize:"1.3rem"}}></i>
            <p>Reviews</p>
        </NavLink>
        <NavLink to='/admin/create-bill' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-solid fa-money-bill" style={{fontSize:"1.3rem"}}></i>
        
            <p>Create Bill</p>
        </NavLink>
        <NavLink to='/admin/all-invoices' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i className="fa-solid fa-file-invoice" style={{fontSize:"1.3rem"}}></i>
            <p>Invoices</p>
        </NavLink>
        <NavLink to='/admin/graph' className="sidebar-option" onClick={() => {clickOption.play()}}>
        <i class="fa-solid fa-chart-simple" style={{fontSize:"1.3rem"}}></i>
            <p>Graph</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar