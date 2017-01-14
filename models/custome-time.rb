module DataMapper
  class Property
    class MySQLTime < String
      def load(v)
        v.to_sym
      end
      def typcast_to_primitive(v)
        v.to_s
      end
    end
  end
end
