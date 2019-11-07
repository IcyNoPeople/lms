const fs = require('fs');
const express = require('express');
const {
    promisify,
} = require('util');

const Router = express.Router();

const mydatabase = require('./database');

const queryAsync = promisify(mydatabase.query).bind(mydatabase);

Router.get('/', (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        res.render('admin', {});
    } else {
        res.send('Please login to view this page!');
    }
});

Router.get('/view/:id', (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;
        var SQL;
        switch (table) {
            case "customer":
                SQL = 'SELECT * FROM customer';
                break;
            case "staff":
                SQL = 'SELECT * FROM staff';
                break;
            case "department":
                SQL = 'SELECT * FROM department';
                break;
            case "loan":
                SQL = 'SELECT * FROM loan';
                break;
            case "loan_type":
                SQL = 'SELECT * FROM loan_type';
                break;
            case "payment":
                SQL = 'SELECT * FROM payment';
                break;
            case "transaction_type":
                SQL = 'SELECT * FROM transaction_type';
                break;
            case "access":
                SQL = 'SELECT * FROM access';
                break;
            case "access_type":
                SQL = 'SELECT * FROM access_type';
                break;
            default:
                break;

        }
        mydatabase.query(SQL, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result);
            res.render('view', {
                table: table,
                tableSQL: result
            });
        })
    } else {
        res.send('Please login to view this page!');
    }

});

Router.get('/add/:id', async (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;
        let departmentSQL = 'SELECT * FROM department';
        let loanTypeSQL = 'SELECT * FROM loan_type';
        let accessTypeSQL = 'SELECT * FROM access_type';
        let transactionSQL = 'SELECT * FROM transaction_type';

        let department = {};
        let loanType = {};
        let accessType = {};
        let transaction = {};

        try {
            department = await queryAsync(departmentSQL);
            loanType = await queryAsync(loanTypeSQL);
            accessType = await queryAsync(accessTypeSQL);
            transaction = await queryAsync(transactionSQL);

            res.render('addCustomer', {
                table: table,
                departments: department,
                loanTypes: loanType,
                accessTypes: accessType,
                transactions: transaction

            })
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.send('Please login to view this page!');
    }
});

Router.post('/add/:id', (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;

        switch (table) {
            case "customer":
                var first_name = req.body.first_name;
                var last_name = req.body.last_name;
                var email = req.body.email;
                var address = req.body.address;
                var postal_code = req.body.postal_code;
                var handphone = req.body.handphone;
                var date_of_birth = req.body.DOB;
                var job_title = req.body.job_title;
                var company = req.body.company;
                var annualSalary = req.body.salary;
                var username = req.body.username;
                var password = req.body.password;

                var query = "call insert_customer_All(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                mydatabase.query(query, [first_name, last_name, email, address, postal_code, handphone, date_of_birth, company, job_title, annualSalary, username, password], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('/admin/view/customer');
                })

                break;
            case "staff":
                var first_name = req.body.first_name;
                var last_name = req.body.last_name;
                var email = req.body.email;
                var position = req.body.position;
                var department_id = req.body.department_id;
                var username = req.body.username;
                var password = req.body.password;

                var query = "call insert_staff_ALL(?,?,?,?,?,?,?)";

                mydatabase.query(query, [first_name, last_name, email, position, department_id, username, password], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('/admin/view/staff');
                })

                break;
            case "department":
                var department_id = req.body.department_id;
                var name = req.body.name;

                var query = 'Insert into department values (?,?);';

                mydatabase.query(query, [department_id, name], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/department');
                })
                break;
            case "loan":
                var loan_type_id = req.body.loan_type_id;
                var account_id = req.body.account_id;
                var loan_amount = req.body.loan_amount;
                var outstanding_amount = req.body.outstanding_amount;
                var start_date = req.body.start_date;
                var end_date = req.body.end_date;
                var status = req.body.status;
                var approver_id = req.body.approver_id;
                var remarks = req.body.remarks;
                var date_of_application = req.body.date_of_application;
                var approved_on_date = req.body.approved_on_date;

                var query = 'call insert_loan_ALL(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

                mydatabase.query(query, [loan_type_id, account_id, loan_amount, outstanding_amount, start_date, end_date, status, approver_id, remarks, date_of_application, approved_on_date], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/loan');
                })
                break;
            case "loan_type":
                var loan_type_id = req.body.loan_type_id;
                var name = req.body.name;
                var description = req.body.description;
                var min_amount = req.body.min_amount;
                var max_amount = req.body.max_amount;
                var duration = req.body.duration;
                var interest = req.body.interest;
                var last_interest = req.body.last_interest;
                var department_id = req.body.department_id;

                var query = 'Insert into loan_type values (?, ?, ?, ?, ?, ?, ?, ?, ?)';

                mydatabase.query(query, [loan_type_id, name, description, min_amount, max_amount, duration, interest, last_interest, department_id], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/loan_type');
                })
                break;
            case "payment":
                var transaction_id = req.body.transaction_id;
                var loan_id = req.body.loan_id;
                var payment_amount = req.body.payment_amount;
                var interest_rate = req.body.interest_rate;
                var principal_amount = req.body.principal_amount;
                var start_date = req.body.start_date;
                var end_date = req.body.end_date;
                var payment_frequency = req.body.payment_frequency;

                var query = 'call insert_payment_ALL(?, ?, ?, ?, ?, ?, ?, ?)';

                mydatabase.query(query, [transaction_id, loan_id, payment_amount, interest_rate, principal_amount, start_date, end_date, payment_frequency], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/payment');
                })
                break;
            case "transaction_type":
                var transaction_type_id = req.body.transaction_type_id;
                var name = req.body.name;

                var query = 'Insert into transaction_type values (?, ?);';

                mydatabase.query(query, [transaction_type_id, name], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/transaction_type');
                })
                break;
            case "access":
                var account_id = req.body.account_id;
                var accesstype_id = req.body.accesstype_id;

                var query = 'Insert into access values (?,?)';

                mydatabase.query(query, [account_id, accesstype_id], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/access');
                })
                break;
            case "access_type":
                var access_id = req.body.access_id;
                var name = req.body.name;
                var approval_limit = req.body.approval_limit;
                var department_id = req.body.department_id;


                var query = 'Insert into access_type values (?, ?, ?, ?)';

                mydatabase.query(query, [access_id, name, approval_limit, department_id], (err, result) => {
                    console.log(result);

                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('admin/view/access_type');
                })
                break;
            default:
                break;

        }
    } else {
        res.send('Please login to view this page!');
    }

});


Router.get('/edit/:id', async (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;
        console.log(table);
        let id = req.query.id;
        var SQL;

        let departmentSQL = 'SELECT * FROM department';
        let loanTypeSQL = 'SELECT * FROM loan_type';
        let accessTypeSQL = 'SELECT * FROM access_type';
        let transactionSQL = 'SELECT * FROM transaction_type';

        let department = {};
        let loanType = {};
        let accessType = {};
        let transaction = {};
        let tableSQL = {};
        try {
            department = await queryAsync(departmentSQL);
            loanType = await queryAsync(loanTypeSQL);
            accessType = await queryAsync(accessTypeSQL);
            transaction = await queryAsync(transactionSQL);

            if (table == "access") {
                SQL = "Select * from access where account_id = ? AND accesstype_id = ?";
                let id2 = req.query.id2;
                tableSQL = await queryAsync(SQL, [id, id2]);
            }
            else {
                switch (table) {
                    case "customer":
                        SQL = "Select * from customer where cus_id = ?;";
                        break;
                    case "staff":
                        SQL = 'SELECT * FROM staff where staff_id = ?';
                        break;
                    case "department":
                        SQL = 'SELECT * FROM department where department_id = ?';
                        break;
                    case "loan":
                        SQL = 'SELECT * FROM loan where loan_id = ?';
                        break;
                    case "loan_type":
                        SQL = 'SELECT * FROM loan_type where loan_type_id = ?';
                        break;
                    case "payment":
                        SQL = 'SELECT * FROM payment where payment_id = ?';
                        break;
                    case "transaction_type":
                        SQL = 'SELECT * FROM transaction_type where transaction_id = ?';
                        break;
                    case "access":
                        SQL = 'SELECT * FROM access where access_id = ?';
                        break;
                    default:
                        break;

                }

                tableSQL = await queryAsync(SQL, [id]);
            }

            console.log(tableSQL);
            res.render('edit', {
                table: table,
                tableSQL: tableSQL[0],
                departments: department,
                loanTypes: loanType,
                accessTypes: accessType,
                transactions: transaction

            });
        } catch (err) {
            console.log('SQL error', err);
            res.status(500).send('Something went wrong');
        }
    } else {
        res.send('Please login to view this page!');
    }
});

Router.post('/edit/:id', (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;
        let id = req.query.id;
        var SQL;

        if (table == "access") {

            SQL = "Update access set account_id = ? AND accesstype_id = ?";
            let id2 = req.query.id2;

            mydatabase.query(SQL, [id, id2], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                console.log("Updated");
                res.redirect('/admin/view/access');
            })
        }
        else {
            switch (table) {
                case "customer":
                    var first_name = req.body.first_name;
                    var last_name = req.body.last_name;
                    var email = req.body.email;
                    var address = req.body.address;
                    var postal_code = req.body.postal_code;
                    var handphone = req.body.handphone;
                    var date_of_birth = req.body.DOB;
                    var job_title = req.body.job_title;
                    var company = req.body.company;
                    var annualSalary = req.body.salary;
                    var username = req.body.username;
                    var password = req.body.password;

                    SQL = "update customer set first_name = ?, last_name = ?, email = ?, address = ?, postal_code = ?, handphone = ?, date_of_birth = ?, job_title = ?, company = ?, annualSalary = ?, username = ?, password = ? where cus_id = ?;";
                    mydatabase.query(SQL, [first_name, last_name, email, address, postal_code, handphone, date_of_birth, job_title, company, annualSalary, username, password, id], (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        console.log("Updated");
                        res.redirect('/admin/view/customer');
                    })
                    break;
                case "staff":
                    var first_name = req.body.first_name;
                    var last_name = req.body.last_name;
                    var email = req.body.email;
                    var position = req.body.position;
                    var department_id = req.body.department_id;
                    var username = req.body.username;
                    var password = req.body.password;

                    SQL = 'update staff set first_name = ?, last_name = ?, email = ?, position = ?, department_id = ?, username = ?, password = ? where staff_id = ?';

                    mydatabase.query(SQL, [first_name, last_name, email, position, department_id, username, password, id], (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        console.log("Updated");
                        res.redirect('/admin/view/access');
                    })

                    break;
                case "department":
                    var department_id = req.body.department_id;
                    var name = req.body.name;

                    var query = 'update department set department_id = ?, name = ? where department_id = ?;';

                    mydatabase.query(query, [department_id, name, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/department');
                    })
                    break;
                case "loan":
                    var loan_type_id = req.body.loan_type_id;
                    var account_id = req.body.account_id;
                    var loan_amount = req.body.loan_amount;
                    var outstanding_amount = req.body.outstanding_amount;
                    var start_date = req.body.start_date;
                    var end_date = req.body.end_date;
                    var status = req.body.status;
                    var approver_id = req.body.approver_id;
                    var remarks = req.body.remarks;
                    var date_of_application = req.body.date_of_application;
                    var approved_on_date = req.body.approved_on_date;

                    var query = 'update loan set loan_type_id = ?, account_id = ?, loan_amount = ?, outstanding_amount = ?, start_date = ?, end_date = ?, status = ?, approver_id = ?, remarks = ?, date_of_application = ?, approved_on_date = ? where loan_id = ?';

                    mydatabase.query(query, [loan_type_id, account_id, loan_amount, outstanding_amount, start_date, end_date, status, approver_id, remarks, date_of_application, approved_on_date, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/loan');
                    })
                    break;
                case "loan_type":
                    var loan_type_id = req.body.loan_type_id;
                    var name = req.body.name;
                    var description = req.body.description;
                    var min_amount = req.body.min_amount;
                    var max_amount = req.body.max_amount;
                    var duration = req.body.duration;
                    var interest = req.body.interest;
                    var last_interest = req.body.last_interest;
                    var department_id = req.body.department_id;

                    var query = 'update loan_type set loan_type_id = ?, name = ?, description = ?, min_amount = ?, max_amount = ?, duration = ?, interest = ?, last_interest = ?, department_id = ? where loan_type_id = ?';

                    mydatabase.query(query, [loan_type_id, name, description, min_amount, max_amount, duration, interest, last_interest, department_id, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/loan_type');
                    })
                    break;
                case "payment":
                    var transaction_id = req.body.transaction_id;
                    var loan_id = req.body.loan_id;
                    var payment_amount = req.body.payment_amount;
                    var interest_rate = req.body.interest_rate;
                    var principal_amount = req.body.principal_amount;
                    var start_date = req.body.start_date;
                    var end_date = req.body.end_date;
                    var payment_frequency = req.body.payment_frequency;

                    var query = 'update payment set transaction_id = ?, loan_id = ?, payment_amount = ?, interest_rate = ?, principal_amount = ?, start_date = ?, end_date = ?, payment_frequency = ? where payment_id = ?';

                    mydatabase.query(query, [transaction_id, loan_id, payment_amount, interest_rate, principal_amount, start_date, end_date, payment_frequency, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/payment');
                    })
                    break;
                case "transaction_type":
                    var transaction_type_id = req.body.transaction_type_id;
                    var name = req.body.name;

                    var query = 'update transaction_type set transaction_type_id = ?, name = ? where transaction_type_id = ?';

                    mydatabase.query(query, [transaction_type_id, name, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/transaction_type');
                    })
                    break;

                case "access_type":
                    var access_id = req.body.access_id;
                    var name = req.body.name;
                    var approval_limit = req.body.approval_limit;
                    var department_id = req.body.department_id;


                    var query = 'update access_type set access_id = ?, name = ?, approval_limit = ?, department_id = ? where access_id = ?';

                    mydatabase.query(query, [access_id, name, approval_limit, department_id, id], (err, result) => {
                        console.log(result);

                        if (err) {
                            return res.status(500).send(err);
                        }

                        res.redirect('admin/view/access_type');
                    })
                    break;
                default:
                    break;

            }
        }
    } else {
        res.send('Please login to view this page!');
    }

});


Router.get('/delete/access', (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        let table = req.params.id;
        let accountid = req.query.accountid;
        let accesstypeid = req.query.accesstypeid;
        var SQL = "DELETE FROM access WHERE accesstype_id = ? AND account_id = ?;";


        mydatabase.query(SQL, [accesstypeid, accountid], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log("Updated");
            res.redirect('/admin/view?table=customer');
        })
    } else {
        res.send('Please login to view this page!');
    }
});

module.exports = Router;