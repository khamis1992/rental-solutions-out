
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateList } from "./TemplateList"
import { AutomationRulesList } from "../AutomationRules/AutomationRulesList"

export const EmailSettings = () => {
  return (
    <Tabs defaultValue="templates" dir="rtl">
      <TabsList>
        <TabsTrigger value="templates">القوالب</TabsTrigger>
        <TabsTrigger value="automation">القواعد التلقائية</TabsTrigger>
      </TabsList>
      <TabsContent value="templates">
        <TemplateList />
      </TabsContent>
      <TabsContent value="automation">
        <AutomationRulesList />
      </TabsContent>
    </Tabs>
  )
}
