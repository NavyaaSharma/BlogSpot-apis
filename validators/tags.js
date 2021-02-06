const {check}=require('express-validator')

exports.tagsValidator=[
    check('name').not().isEmpty().withMessage('Name is required')
]