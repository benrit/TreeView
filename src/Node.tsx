import { useState } from 'react';
import styles from './styles.module.css';
import classNames from 'classnames/bind';


interface State {
    checked: boolean;
    selected: boolean;

}

interface Node_t {
    name: string;
    state: State;
    children: Node[]
}

interface Props {
    data: Node_t
    checkable?: boolean;
}

const classes = classNames.bind(styles);


const setCheckBox = (item: any) => {
    item.state.checked = true
}

export default function Node(props: Props){

    const [state_, setState_] = useState(props.data.state);

    const CheckBox_renderer = () => {
        return (
            <span 
                className={classes("icons", "checkIcon", {checked: state_.checked})} 
                onClick={()=>setCheckBox(props.data)}>    
            </span>
        )
    }

    return (
        <div>
            {!props.checkable || CheckBox_renderer()}
            <span style={{fontSize: '14px'}}>{props.data.name}</span>
        </div>

    )
}