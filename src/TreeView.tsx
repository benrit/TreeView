import { useState, MouseEvent, useEffect } from "react";
import useContextMenu from "./useContextMenu";

import iconStyle from './icon.module.css';


export enum CheckState{
    Unchecked, Checked, PartiallyChecked 
}

interface TreeNode_State_i {
    isOpen: boolean;
    isEditing: boolean;
    isChecked: CheckState;
    hasChildren: boolean;
    level: number;
    index: number;    
}

enum TreeType{
    hidden = 0,  folder = 14, entry = 28, unchecked = 42, checked = 56, tristate = 70
}

interface TreeNode_i {
    name: string;
    parent: TreeNode_i | null;
    state: TreeNode_State_i;
    children: TreeNode_i[];
    type: TreeType;
    data: any;
    update: Function;
    setContextMenu: Function;
    color?: string;
}


const flattenTree = (tree: TreeNode_i, updateFn: Function, contextMenu: Function): TreeNode_i[] => {

    const temp: TreeNode_i[] = []

    const iter = (tn: TreeNode_i, level: number, index: number) => {
        const hasChildren = tn.children && tn.children.length > 0;

        tn.state.level = level;
        tn.state.index = index;
        tn.state.hasChildren = hasChildren;
        tn.update = updateFn;
        tn.setContextMenu = contextMenu;
        
        temp.push(tn);

        if (hasChildren && tn.state.isOpen) {
            tn.children.forEach((n, ii) => {
                iter(n, level + 1, ii);
            })
        }
    }

    tree.children.forEach((item, ii) => {
        iter(item, 0, ii)
    })

    return temp;
}

export const createNode = (name: string, parent: TreeNode_i | null, data: any, type: TreeType = TreeType.folder): TreeNode_i => {
    return {
        name: name,
        parent: parent,
        state: {hasChildren: false, isEditing: false, isOpen: true, isChecked: CheckState.Unchecked, level: 0, index: 0},
        children: [],
        type,
        data,
        update: ()=>{},
        setContextMenu: (event: MouseEvent) => {
            console.log(event);
        }
    };
}

interface Props {
    data: TreeNode_i
}


function Icon({type}: {type: TreeType}) {
    let classes: string[] = [];
    classes.push(iconStyle.icon);
    return (
        <div style={{backgroundPosition: `left -${type}px top 0px`}} className={classes.join(" ")}></div>
    )
}


function CheckBox({checked, onClick}: {checked: CheckState, onClick: any}) {
    let classes: string[] = [];
    classes.push(iconStyle.icon);
    let ischecked = checked ? TreeType.checked: TreeType.unchecked;

    return (
        <div 
            style={{backgroundPosition: `left -${ischecked}px top 0px`}} className={classes.join(" ")}
            onClick={onClick}
        ></div>
    )
}



function IconExpander({isOpen, onClick, hasChildren}: any) {
    
    return (
            <svg className={iconStyle.expand_svg} onClick={onClick}>
                {hasChildren && <g transform={`rotate(${isOpen ? "0" : "-90"} 7 7)`}>
                    <path fill="none" stroke="black" strokeWidth="2" d="M 2,5 L 7,10 L 12,5"/>
                </g>}
            </svg>
        ) 
}

function TreeItem({data}: Props){

    const toggleisOpen = () => {
        data.state.isOpen = !data.state.isOpen;
        data.update();
    }

    const toggleSelection = () => {

        data.state.isChecked = data.state.isChecked === CheckState.Checked ? CheckState.Unchecked : CheckState.Checked;

        const iter = (children: TreeNode_i[]) => {
            children.forEach((child)=>{
                child.state.isChecked = data.state.isChecked;
                if(child.state.hasChildren) {
                    iter(child.children);
                }
            })
        }

        if(data.children.length > 0){
            iter(data.children);
        }


        const parent = (parent_node: TreeNode_i | null) => {
            const count = parent_node?.children.reduce<number>((acc, current)=>{
                return current.state.isChecked === CheckState.Checked ? acc+1 : acc;

            },0)

            if (count !== parent_node?.children.length){
                parent_node.state.isChecked = CheckState.PartiallyChecked;

            }

            if (parent_node!.parent){
                parent(parent_node!.parent)
            }
        }

        parent(data.parent);

        data.update();
    }

    return (
        <tr style={{width: "450px"}}>
            <td style={{paddingLeft: data.state.level * 10}}
                onContextMenu={
                    (e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        data.setContextMenu(e, data);
                    }}    
                >   
                <IconExpander isOpen={data.state.isOpen} onClick={toggleisOpen} hasChildren={data.state.hasChildren}/>
                <Icon type={data.state.hasChildren ? TreeType.folder: TreeType.entry}/>
                <CheckBox checked={data.state.isChecked} onClick={toggleSelection}/>
                <span style={{fontSize: 14}}>{data.name}</span>
            </td>
                <td>{data.data}</td>
                <td>more stuff</td>
        </tr>)
}


export function TreeView({data}: Props){
    const [selectedItems, setSelectedItems] = useState<TreeNode_i[]>([])

    const {showContext, contextMenu} = useContextMenu(
        [{
            name: "Add below", fn: (d: TreeNode_i) => {
                console.log(d);
                d.parent?.children.splice(d.state.index + 1, 0, createNode(`new node ${d.state.index}`, d.parent, null));
                update();
            }
         },{
            name: "Insert",
            fn: (d: TreeNode_i) => {
                d.children.push(createNode(`new Child ${d.state.index}`, d, null));
                update();
            }
        }
        ]
    );
    const [entries, setEntries] = useState<{
        treeData: JSX.Element[],
        contextMenu: JSX.Element | undefined | any,
        metadata: any
    }>({
        treeData: [],
        contextMenu: contextMenu,
        metadata: {}
    })

    const update = () => {
        const tempTree: JSX.Element[] = []
        const selected: TreeNode_i[] = [];
        const tree = flattenTree(data, update, (event: MouseEvent<HTMLDivElement>, element: any) => {
            showContext(event, element);
        });

        tree.forEach((item, index) => {
            if (item.state.isChecked && !item.state.hasChildren){
                selected.push(item);
            }
            tempTree.push(<TreeItem key={index} data={item}/>)
        })

        setEntries(() => {
            return {
                treeData: tempTree,
                contextMenu: contextMenu,
                metadata: null
            }
        });
        setSelectedItems(selected);
    }

    useEffect(() => {
        update();
    }, [])

    return (
        <div className={iconStyle.fixTableHead}>
            <table>
                <thead>
                    <tr>
                        <th>Items</th>
                        <th>Time</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.treeData}
                </tbody>
            </table>
            {contextMenu}
        </div>
    )
}