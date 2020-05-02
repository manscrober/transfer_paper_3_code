import TreeMap from 'ts-treemap';
interface sessionData{
    user,ip,iat,exp
}
class UserDB{
    private static logged_in_users:Map<string,sessionData>;
    private static sessions_by_key:TreeMap<number,string>
    public static initUserDB(){
        UserDB.logged_in_users=new Map<string,sessionData>();
        UserDB.sessions_by_key =new TreeMap<number,string>();
    }
    public static set(sessID:string,{user,ip,iat,exp} ){
        UserDB.logged_in_users.set(sessID,{user,ip,iat,exp});
        UserDB.sessions_by_key.set(exp,sessID);
    }
    public static delete(sessID){
        UserDB.sessions_by_key.delete(UserDB.logged_in_users.get(sessID).exp);
        UserDB.logged_in_users.delete(sessID);
    }
    public static updateExp(sessID:string, exp:number){
        let data=UserDB.get(sessID);
        UserDB.sessions_by_key.delete(data.exp);
        data.exp=exp;
        UserDB.set(sessID,data);
    }
    public static has(sessID:string){
        return UserDB.logged_in_users.has(sessID);
    }
    public static cleanUp(){
        console.log("cleaning expired sessions");
        let counter=0;
        var keys=UserDB.sessions_by_key.keys()
        var key=keys.next();
        while(!key.done && key.value<Date.now()){
            UserDB.logged_in_users.delete(UserDB.sessions_by_key.get(key.value));
            UserDB.sessions_by_key.delete(key.value);
            key=keys.next();
            counter++;
        }
        console.log(counter + " expired sessions cleaned up");
        console.log(UserDB.sessions_by_key);
        console.log(Date.now());
    }
    public static get(sessID:string):sessionData{
        return UserDB.logged_in_users.get(sessID);
    }
}
export default UserDB;